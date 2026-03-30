import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useDeal } from '@/hooks/useDeals';
import {
  useAddSessionDocument,
  useAddSessionRecipient,
  useCreateSigningSession,
  useRemoveSessionRecipient,
  useSessionDocuments,
  useSessionRecipients,
  useSigningSession,
  useUpdateSessionRecipient,
  useUpdateSigningSession,
} from '@/hooks/useSigningSessions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const STEPS = ['Details', 'Documents', 'Recipients', 'Roles', 'Settings'] as const;
const CUSTOM_ROLE_VALUE = '__custom__';
const RECIPIENT_TYPE_OPTIONS = [
  { value: 'signer', label: 'Signer' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'cc', label: 'CC Recipient' },
] as const;

interface LocalRecipient {
  id?: string;
  local_id: string;
  first_name: string;
  last_name: string;
  email: string;
  type: string;
  sort_order: number;
  contact_id?: string;
}

interface LocalRoleAssignment {
  id: string;
  role_option: string;
  custom_role_name: string;
  recipient_local_id: string | null;
}

interface PendingSessionDocument {
  checklistItemId: string;
  name: string;
  storage_path: string;
  page_count: number;
}

interface DealPerson {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface PersistedRoleAssignment {
  id: string;
  role_name: string;
  recipient_id: string | null;
}

const reindexRecipients = (recipients: LocalRecipient[]) =>
  recipients.map((recipient, index) => ({
    ...recipient,
    sort_order: index,
  }));

const normalizeDocumentName = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const normalizeComparison = (value: string) =>
  value.toLowerCase().replace(/\s+/g, ' ').trim();

const getRecipientLabel = (recipient: LocalRecipient) =>
  [recipient.first_name, recipient.last_name].filter(Boolean).join(' ').trim() || recipient.email || 'Unassigned';

const getRoleName = (role: LocalRoleAssignment) =>
  role.role_option === CUSTOM_ROLE_VALUE
    ? role.custom_role_name.trim() || 'Custom Role'
    : role.role_option;

const buildNumberedRole = (baseRole: string, count: number) => `${baseRole.trim()} ${count}`;

const findMatchingAdminDocument = (
  checklistName: string,
  adminDocs: Array<{ file_name: string; storage_path: string }>
) => {
  const normalizedChecklist = normalizeDocumentName(checklistName);
  const checklistTokens = normalizedChecklist.split(' ').filter((token) => token.length > 2);

  return adminDocs.find((doc) => {
    const normalizedFileName = normalizeDocumentName(doc.file_name);
    if (
      normalizedFileName.includes(normalizedChecklist) ||
      normalizedChecklist.includes(normalizedFileName)
    ) {
      return true;
    }

    const matchedTokenCount = checklistTokens.filter((token) =>
      normalizedFileName.includes(token)
    ).length;

    return checklistTokens.length > 0 && matchedTokenCount >= Math.max(2, checklistTokens.length - 1);
  });
};

const buildSuggestedRoleOptions = (dealPeople: DealPerson[], recipients: LocalRecipient[]) => {
  const numberedRoles: string[] = [];
  const roleCounts = new Map<string, number>();

  const pushRole = (baseRole: string) => {
    const normalizedRole = baseRole.trim();
    if (!normalizedRole) return;

    const nextCount = (roleCounts.get(normalizedRole) || 0) + 1;
    roleCounts.set(normalizedRole, nextCount);
    numberedRoles.push(buildNumberedRole(normalizedRole, nextCount));
  };

  dealPeople.forEach((person) => pushRole(person.role || 'Signer'));
  recipients.forEach((recipient) => {
    if (recipient.type === 'reviewer') {
      pushRole('Reviewer');
      return;
    }

    if (recipient.type === 'cc') {
      pushRole('CC Recipient');
      return;
    }

    pushRole('Signer');
  });

  return Array.from(
    new Set([
      'Seller 1',
      'Seller 2',
      'Buyer 1',
      'Buyer 2',
      'Seller Agent 1',
      'Buyer Agent 1',
      'Seller Broker 1',
      'Buyer Broker 1',
      'Title 1',
      'Signer 1',
      'Reviewer 1',
      'CC Recipient 1',
      ...numberedRoles,
    ])
  );
};

const buildLocalRoleAssignment = (
  roleName: string,
  recipientLocalId: string | null,
  suggestedRoleOptions: string[],
  id: string = crypto.randomUUID()
): LocalRoleAssignment => {
  const normalizedRoleName = roleName.trim();

  if (normalizedRoleName && suggestedRoleOptions.includes(normalizedRoleName)) {
    return {
      id,
      role_option: normalizedRoleName,
      custom_role_name: '',
      recipient_local_id: recipientLocalId,
    };
  }

  return {
    id,
    role_option: CUSTOM_ROLE_VALUE,
    custom_role_name: normalizedRoleName || 'Custom Role',
    recipient_local_id: recipientLocalId,
  };
};

const buildDefaultRoleAssignments = (
  recipients: LocalRecipient[],
  dealPeople: DealPerson[],
  suggestedRoleOptions: string[]
) => {
  const roleCounts = new Map<string, number>();

  return recipients.map((recipient) => {
    const matchedDealPerson =
      dealPeople.find((person) => recipient.contact_id && person.id === recipient.contact_id) ||
      dealPeople.find(
        (person) =>
          !!person.email &&
          !!recipient.email &&
          normalizeComparison(person.email) === normalizeComparison(recipient.email)
      ) ||
      dealPeople.find(
        (person) =>
          normalizeComparison(`${person.first_name} ${person.last_name}`) ===
          normalizeComparison(`${recipient.first_name} ${recipient.last_name}`)
      );

    const baseRole =
      matchedDealPerson?.role?.trim() ||
      (recipient.type === 'reviewer'
        ? 'Reviewer'
        : recipient.type === 'cc'
          ? 'CC Recipient'
          : 'Signer');

    const nextCount = (roleCounts.get(baseRole) || 0) + 1;
    roleCounts.set(baseRole, nextCount);

    return buildLocalRoleAssignment(
      buildNumberedRole(baseRole, nextCount),
      recipient.local_id,
      suggestedRoleOptions
    );
  });
};

const parsePersistedRoleAssignments = (
  value: unknown,
  recipients: LocalRecipient[],
  suggestedRoleOptions: string[]
) => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];

    const roleName =
      typeof (item as { role_name?: unknown }).role_name === 'string'
        ? (item as { role_name: string }).role_name.trim()
        : '';

    if (!roleName) return [];

    const persistedRecipientId =
      typeof (item as { recipient_id?: unknown }).recipient_id === 'string'
        ? (item as { recipient_id: string }).recipient_id
        : null;

    const matchedRecipient = persistedRecipientId
      ? recipients.find(
          (recipient) =>
            recipient.id === persistedRecipientId || recipient.local_id === persistedRecipientId
        )
      : undefined;

    const persistedId =
      typeof (item as { id?: unknown }).id === 'string'
        ? (item as { id: string }).id
        : crypto.randomUUID();

    return [
      buildLocalRoleAssignment(
        roleName,
        matchedRecipient?.local_id || null,
        suggestedRoleOptions,
        persistedId
      ),
    ];
  });
};

const buildPersistedRoleAssignments = (
  roleAssignments: LocalRoleAssignment[],
  recipients: LocalRecipient[],
  createdRecipientIds: Record<string, string>
): PersistedRoleAssignment[] =>
  roleAssignments
    .map((roleAssignment) => {
      const resolvedRecipientId = roleAssignment.recipient_local_id
        ? recipients.find(
            (recipient) =>
              recipient.local_id === roleAssignment.recipient_local_id ||
              recipient.id === roleAssignment.recipient_local_id
          )?.id ||
          createdRecipientIds[roleAssignment.recipient_local_id] ||
          null
        : null;

      return {
        id: roleAssignment.id,
        role_name: getRoleName(roleAssignment),
        recipient_id: resolvedRecipientId,
      };
    })
    .filter((roleAssignment) => roleAssignment.role_name.trim().length > 0);

export default function SigningSessionSetup() {
  const { id: dealId, sessionId } = useParams<{ id: string; sessionId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = sessionId === 'new';

  const { data: deal } = useDeal(dealId);
  const { data: existingSession } = useSigningSession(isNew ? undefined : sessionId);
  const { data: existingRecipients } = useSessionRecipients(isNew ? undefined : sessionId);
  const { data: existingDocs } = useSessionDocuments(isNew ? undefined : sessionId);

  const createSession = useCreateSigningSession();
  const updateSession = useUpdateSigningSession();
  const addRecipient = useAddSessionRecipient();
  const removeRecipient = useRemoveSessionRecipient();
  const updateRecipient = useUpdateSessionRecipient();
  const addDocument = useAddSessionDocument();

  const selectedDocumentsParam = searchParams.get('documents') || '';
  const selectedDocumentIds = selectedDocumentsParam
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const [step, setStep] = useState(0);
  const [sessionName, setSessionName] = useState('');
  const [emailMessage, setEmailMessage] = useState('Please review and sign the attached document(s).');
  const [signingOrderEnabled, setSigningOrderEnabled] = useState(false);
  const [recipients, setRecipients] = useState<LocalRecipient[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<LocalRoleAssignment[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<PendingSessionDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsResolved, setDocumentsResolved] = useState(selectedDocumentIds.length === 0);
  const [draftSessionId, setDraftSessionId] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [reminderDays, setReminderDays] = useState(3);
  const [enableReminders, setEnableReminders] = useState(false);
  const [enableExpiration, setEnableExpiration] = useState(false);
  const [expirationDays, setExpirationDays] = useState(30);

  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newType, setNewType] = useState('signer');
  const [draggedRecipientId, setDraggedRecipientId] = useState<string | null>(null);
  const [dragOverRecipientId, setDragOverRecipientId] = useState<string | null>(null);

  const lastSavedSnapshotRef = useRef('');
  const hasBootstrappedDraftRef = useRef(false);
  const hasInsertedDraftDocumentsRef = useRef(false);
  const haveHydratedRolesRef = useRef(false);

  const targetSessionId = isNew ? draftSessionId : sessionId || null;

  const dealPeople: DealPerson[] = (deal?.deal_contacts || [])
    .map((dealContact) => ({
      id: dealContact.contact?.id || dealContact.contact_id,
      first_name: dealContact.contact?.first_name || '',
      last_name: dealContact.contact?.last_name || '',
      email: dealContact.contact?.email || '',
      role: dealContact.role || 'Other',
    }))
    .filter((person) => !!person.id);

  const suggestedRoleOptions = buildSuggestedRoleOptions(dealPeople, recipients);
  const availableRoleOptions = Array.from(
    new Set([
      ...suggestedRoleOptions,
      ...roleAssignments
        .filter((roleAssignment) => roleAssignment.role_option !== CUSTOM_ROLE_VALUE)
        .map((roleAssignment) => roleAssignment.role_option),
    ])
  );
  const dealPeopleKey = dealPeople
    .map((person) => `${person.id}:${person.role}:${person.email}`)
    .join('|');
  const suggestedRoleOptionsKey = suggestedRoleOptions.join('|');

  const buildSnapshot = useCallback(
    () =>
      JSON.stringify({
        sessionName,
        emailMessage,
        signingOrderEnabled,
        reminderDays: enableReminders ? reminderDays : 0,
        enableExpiration,
        expirationDays: enableExpiration ? expirationDays : 0,
        recipients: recipients.map((recipient) => ({
          id: recipient.id || null,
          contact_id: recipient.contact_id || null,
          first_name: recipient.first_name,
          last_name: recipient.last_name,
          email: recipient.email,
          type: recipient.type,
          sort_order: recipient.sort_order,
        })),
        roleAssignments: roleAssignments.map((roleAssignment) => ({
          id: roleAssignment.id,
          role_name: getRoleName(roleAssignment),
          recipient_local_id: roleAssignment.recipient_local_id,
        })),
      }),
    [
      emailMessage,
      enableExpiration,
      enableReminders,
      expirationDays,
      recipients,
      reminderDays,
      roleAssignments,
      sessionName,
      signingOrderEnabled,
    ]
  );

  useEffect(() => {
    if (!existingSession) return;

    setSessionName(existingSession.session_name);
    setEmailMessage(existingSession.email_message || '');
    setSigningOrderEnabled(existingSession.signing_order_enabled || false);
    setReminderDays(existingSession.reminder_interval_days || 3);
    setEnableReminders((existingSession.reminder_interval_days || 0) > 0);
    setEnableExpiration(!!existingSession.expiration_date);

    if (existingSession.expiration_date) {
      setExpirationDays(
        Math.max(
          1,
          Math.ceil(
            (new Date(existingSession.expiration_date).getTime() - Date.now()) / 86400000
          )
        )
      );
    }
  }, [existingSession]);

  useEffect(() => {
    if (!existingRecipients) return;

    setRecipients(
      reindexRecipients(
        existingRecipients.map((recipient) => ({
          id: recipient.id,
          local_id: recipient.id,
          first_name: recipient.first_name,
          last_name: recipient.last_name,
          email: recipient.email,
          type: recipient.type,
          sort_order: recipient.sort_order || 0,
          contact_id: recipient.contact_id || undefined,
        }))
      )
    );
  }, [existingRecipients]);

  useEffect(() => {
    if (isNew && deal && !sessionName) {
      setSessionName(`Signing - ${deal.address}`);
    }
  }, [deal, isNew, sessionName]);

  useEffect(() => {
    const hasPersistedRoles =
      Array.isArray(existingSession?.role_assignments) &&
      existingSession.role_assignments.length > 0;
    const canHydrateRoles =
      recipients.length > 0 || hasPersistedRoles || (!isNew && existingRecipients !== undefined);

    if (!canHydrateRoles) return;

    if (!haveHydratedRolesRef.current) {
      const persistedRoles = parsePersistedRoleAssignments(
        existingSession?.role_assignments,
        recipients,
        suggestedRoleOptions
      );

      setRoleAssignments(
        persistedRoles.length
          ? persistedRoles
          : buildDefaultRoleAssignments(recipients, dealPeople, suggestedRoleOptions)
      );
      haveHydratedRolesRef.current = true;
      return;
    }

    const validRecipientIds = new Set(recipients.map((recipient) => recipient.local_id));
    setRoleAssignments((currentRoleAssignments) =>
      {
        const nextRoleAssignments = currentRoleAssignments.map((roleAssignment) =>
        roleAssignment.recipient_local_id &&
        !validRecipientIds.has(roleAssignment.recipient_local_id)
          ? {
              ...roleAssignment,
              recipient_local_id: null,
            }
          : roleAssignment
        );

        const hasChanges = nextRoleAssignments.some(
          (roleAssignment, index) =>
            roleAssignment.recipient_local_id !== currentRoleAssignments[index]?.recipient_local_id
        );

        return hasChanges ? nextRoleAssignments : currentRoleAssignments;
      }
    );
  }, [
    dealPeopleKey,
    existingRecipients,
    existingSession?.role_assignments,
    isNew,
    recipients,
    suggestedRoleOptionsKey,
  ]);

  useEffect(() => {
    if (!isNew || !deal) return;

    const selectedChecklistItems = (deal.checklist_items || []).filter((item) =>
      selectedDocumentIds.includes(item.id)
    );

    if (selectedChecklistItems.length === 0) {
      setPendingDocuments([]);
      setDocumentsResolved(true);
      return;
    }

    let cancelled = false;

    const loadPendingDocuments = async () => {
      setDocumentsLoading(true);
      setDocumentsResolved(false);

      try {
        const { data: adminDocs, error } = await supabase
          .from('admin_documents')
          .select('file_name, storage_path')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const resolvedDocuments = selectedChecklistItems.map((item) => {
          const match = findMatchingAdminDocument(item.name, adminDocs || []);

          return {
            checklistItemId: item.id,
            name: item.name,
            storage_path: match?.storage_path || '',
            page_count: match ? 1 : 0,
          };
        });

        if (!cancelled) {
          setPendingDocuments(resolvedDocuments);
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to resolve selected documents');
          setPendingDocuments(
            selectedChecklistItems.map((item) => ({
              checklistItemId: item.id,
              name: item.name,
              storage_path: '',
              page_count: 0,
            }))
          );
        }
      } finally {
        if (!cancelled) {
          setDocumentsLoading(false);
          setDocumentsResolved(true);
        }
      }
    };

    loadPendingDocuments();

    return () => {
      cancelled = true;
    };
  }, [deal, isNew, selectedDocumentsParam]);

  const updateLocalRecipient = (
    localId: string,
    field: keyof Pick<LocalRecipient, 'first_name' | 'last_name' | 'email' | 'type'>,
    value: string
  ) => {
    setRecipients((currentRecipients) =>
      currentRecipients.map((recipient) =>
        recipient.local_id === localId
          ? {
              ...recipient,
              [field]: value,
            }
          : recipient
      )
    );
  };

  const updateRoleAssignment = (
    roleId: string,
    updates: Partial<Pick<LocalRoleAssignment, 'role_option' | 'custom_role_name' | 'recipient_local_id'>>
  ) => {
    setRoleAssignments((currentRoleAssignments) =>
      currentRoleAssignments.map((roleAssignment) =>
        roleAssignment.id === roleId
          ? {
              ...roleAssignment,
              ...updates,
            }
          : roleAssignment
      )
    );
  };

  const syncRecipients = useCallback(
    async (nextSessionId: string) => {
      const createdRecipientIds: Record<string, string> = {};

      for (const recipient of recipients) {
        if (recipient.id) {
          await updateRecipient.mutateAsync({
            id: recipient.id,
            session_id: nextSessionId,
            first_name: recipient.first_name,
            last_name: recipient.last_name,
            email: recipient.email,
            type: recipient.type,
            sort_order: recipient.sort_order,
            contact_id: recipient.contact_id || null,
          });
          continue;
        }

        const createdRecipient = await addRecipient.mutateAsync({
          session_id: nextSessionId,
          first_name: recipient.first_name,
          last_name: recipient.last_name,
          email: recipient.email,
          type: recipient.type,
          sort_order: recipient.sort_order,
          contact_id: recipient.contact_id,
        });

        createdRecipientIds[recipient.local_id] = createdRecipient.id;
      }

      if (Object.keys(createdRecipientIds).length > 0) {
        setRecipients((currentRecipients) =>
          reindexRecipients(
            currentRecipients.map((recipient) =>
              createdRecipientIds[recipient.local_id]
                ? {
                    ...recipient,
                    id: createdRecipientIds[recipient.local_id],
                    local_id: createdRecipientIds[recipient.local_id],
                  }
                : recipient
            )
          )
        );

        setRoleAssignments((currentRoleAssignments) =>
          currentRoleAssignments.map((roleAssignment) =>
            roleAssignment.recipient_local_id &&
            createdRecipientIds[roleAssignment.recipient_local_id]
              ? {
                  ...roleAssignment,
                  recipient_local_id: createdRecipientIds[roleAssignment.recipient_local_id],
                }
              : roleAssignment
          )
        );
      }

      for (const existingRecipient of existingRecipients || []) {
        const stillPresent = recipients.some((recipient) => recipient.id === existingRecipient.id);
        if (!stillPresent) {
          await removeRecipient.mutateAsync({
            id: existingRecipient.id,
            session_id: nextSessionId,
          });
        }
      }

      return createdRecipientIds;
    },
    [addRecipient, existingRecipients, recipients, removeRecipient, updateRecipient]
  );

  const persistSession = useCallback(
    async (nextSessionId: string) => {
      setAutosaveStatus('saving');

      const createdRecipientIds = await syncRecipients(nextSessionId);

      await updateSession.mutateAsync({
        id: nextSessionId,
        session_name: sessionName,
        email_message: emailMessage,
        signing_order_enabled: signingOrderEnabled,
        reminder_interval_days: enableReminders ? reminderDays : 0,
        expiration_date: enableExpiration
          ? new Date(Date.now() + expirationDays * 86400000).toISOString()
          : null,
        role_assignments: buildPersistedRoleAssignments(
          roleAssignments,
          recipients,
          createdRecipientIds
        ),
      });

      lastSavedSnapshotRef.current = buildSnapshot();
      setAutosaveStatus('saved');
    },
    [
      buildSnapshot,
      emailMessage,
      enableExpiration,
      enableReminders,
      expirationDays,
      recipients,
      reminderDays,
      roleAssignments,
      sessionName,
      signingOrderEnabled,
      syncRecipients,
      updateSession,
    ]
  );

  useEffect(() => {
    if (isNew || !existingSession || existingRecipients === undefined) return;

    const snapshotRecipients = reindexRecipients(
      existingRecipients.map((recipient) => ({
        id: recipient.id,
        local_id: recipient.id,
        first_name: recipient.first_name,
        last_name: recipient.last_name,
        email: recipient.email,
        type: recipient.type,
        sort_order: recipient.sort_order || 0,
        contact_id: recipient.contact_id || undefined,
      }))
    );
    const snapshotRoleOptions = buildSuggestedRoleOptions(dealPeople, snapshotRecipients);
    const snapshotRoleAssignments =
      parsePersistedRoleAssignments(
        existingSession.role_assignments,
        snapshotRecipients,
        snapshotRoleOptions
      ).map((roleAssignment) => ({
        id: roleAssignment.id,
        role_name: getRoleName(roleAssignment),
        recipient_local_id: roleAssignment.recipient_local_id,
      })) ||
      [];

    lastSavedSnapshotRef.current = JSON.stringify({
      sessionName: existingSession.session_name,
      emailMessage: existingSession.email_message || '',
      signingOrderEnabled: existingSession.signing_order_enabled || false,
      reminderDays: existingSession.reminder_interval_days || 0,
      enableExpiration: !!existingSession.expiration_date,
      expirationDays: existingSession.expiration_date
        ? Math.max(
            1,
            Math.ceil(
              (new Date(existingSession.expiration_date).getTime() - Date.now()) / 86400000
            )
          )
        : 0,
      recipients: snapshotRecipients.map((recipient) => ({
        id: recipient.id,
        contact_id: recipient.contact_id || null,
        first_name: recipient.first_name,
        last_name: recipient.last_name,
        email: recipient.email,
        type: recipient.type,
        sort_order: recipient.sort_order || 0,
      })),
      roleAssignments: snapshotRoleAssignments,
    });
  }, [dealPeopleKey, existingRecipients, existingSession, isNew]);

  useEffect(() => {
    if (!isNew || !dealId || !deal || draftSessionId || hasBootstrappedDraftRef.current) return;
    if (!documentsResolved) return;

    hasBootstrappedDraftRef.current = true;

    let cancelled = false;

    const createDraftSession = async () => {
      try {
        setAutosaveStatus('saving');

        const created = await createSession.mutateAsync({
          deal_id: dealId,
          session_name: sessionName || `Signing - ${deal.address || ''}`,
          email_message: emailMessage,
          signing_order_enabled: signingOrderEnabled,
          reminder_interval_days: enableReminders ? reminderDays : 0,
          expiration_date: enableExpiration
            ? new Date(Date.now() + expirationDays * 86400000).toISOString()
            : undefined,
          role_assignments: [],
        });

        if (cancelled) return;

        setDraftSessionId(created.id);

        if (!hasInsertedDraftDocumentsRef.current) {
          hasInsertedDraftDocumentsRef.current = true;
          for (const [index, document] of pendingDocuments.entries()) {
            await addDocument.mutateAsync({
              session_id: created.id,
              name: document.name,
              storage_path: document.storage_path,
              sort_order: index,
              page_count: document.page_count,
            });
          }
        }

        lastSavedSnapshotRef.current = buildSnapshot();
        setAutosaveStatus('saved');
        navigate(`/transactions/${dealId}/signing-session/${created.id}/setup`, { replace: true });
      } catch {
        if (!cancelled) {
          hasBootstrappedDraftRef.current = false;
          setAutosaveStatus('error');
          toast.error('Failed to start signing session');
        }
      }
    };

    createDraftSession();

    return () => {
      cancelled = true;
    };
  }, [
    addDocument,
    buildSnapshot,
    createSession,
    deal,
    dealId,
    documentsResolved,
    draftSessionId,
    emailMessage,
    enableExpiration,
    enableReminders,
    expirationDays,
    isNew,
    navigate,
    pendingDocuments,
    reminderDays,
    sessionName,
    signingOrderEnabled,
  ]);

  useEffect(() => {
    if (!targetSessionId) return;
    if (!isNew && (existingSession === undefined || existingRecipients === undefined)) return;
    if (createSession.isPending) return;

    const snapshot = buildSnapshot();
    if (snapshot === lastSavedSnapshotRef.current) return;

    const timeoutId = window.setTimeout(async () => {
      try {
        await persistSession(targetSessionId);
      } catch {
        setAutosaveStatus('error');
      }
    }, 800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    buildSnapshot,
    createSession.isPending,
    existingRecipients,
    existingSession,
    isNew,
    persistSession,
    targetSessionId,
  ]);

  const documentsForStep = isNew
    ? pendingDocuments
    : (existingDocs || []).map((doc) => ({
        checklistItemId: doc.id,
        name: doc.name,
        storage_path: doc.storage_path,
        page_count: doc.page_count || 0,
      }));

  const addLocalRecipient = () => {
    if (!newFirst.trim() || !newEmail.trim()) {
      toast.error('First name and email are required');
      return;
    }

    setRecipients((currentRecipients) =>
      reindexRecipients([
        ...currentRecipients,
        {
          local_id: crypto.randomUUID(),
          first_name: newFirst.trim(),
          last_name: newLast.trim(),
          email: newEmail.trim(),
          type: newType,
          sort_order: currentRecipients.length,
        },
      ])
    );

    setNewFirst('');
    setNewLast('');
    setNewEmail('');
    setNewType('signer');
  };

  const removeLocalRecipient = (localId: string) => {
    setRecipients((currentRecipients) =>
      reindexRecipients(currentRecipients.filter((recipient) => recipient.local_id !== localId))
    );
  };

  const addFromDealPeople = (personId: string) => {
    const person = dealPeople.find((item) => item.id === personId);
    if (!person) return;

    if (recipients.some((recipient) => recipient.contact_id === personId)) {
      toast.info('Already added');
      return;
    }

    setRecipients((currentRecipients) =>
      reindexRecipients([
        ...currentRecipients,
        {
          local_id: crypto.randomUUID(),
          first_name: person.first_name,
          last_name: person.last_name,
          email: person.email || '',
          type: 'signer',
          sort_order: currentRecipients.length,
          contact_id: person.id,
        },
      ])
    );
  };

  const addRoleAssignment = () => {
    setRoleAssignments((currentRoleAssignments) => [
      ...currentRoleAssignments,
      {
        id: crypto.randomUUID(),
        role_option: CUSTOM_ROLE_VALUE,
        custom_role_name: `Custom Role ${currentRoleAssignments.length + 1}`,
        recipient_local_id: recipients[0]?.local_id || null,
      },
    ]);
  };

  const removeRoleAssignment = (roleId: string) => {
    setRoleAssignments((currentRoleAssignments) =>
      currentRoleAssignments.filter((roleAssignment) => roleAssignment.id !== roleId)
    );
  };

  const moveRecipient = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    setRecipients((currentRecipients) => {
      const fromIndex = currentRecipients.findIndex(
        (recipient) => recipient.local_id === draggedId
      );
      const toIndex = currentRecipients.findIndex((recipient) => recipient.local_id === targetId);

      if (fromIndex === -1 || toIndex === -1) return currentRecipients;

      const nextRecipients = [...currentRecipients];
      const [movedRecipient] = nextRecipients.splice(fromIndex, 1);
      nextRecipients.splice(toIndex, 0, movedRecipient);
      return reindexRecipients(nextRecipients);
    });
  };

  const handleContinue = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    try {
      if (!targetSessionId) {
        toast.error('Signing session is still being created');
        return;
      }

      await persistSession(targetSessionId);
      navigate(`/transactions/${dealId}/signing-session/${targetSessionId}/prepare`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/transactions/${dealId}/signing-sessions`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">
            {isNew ? 'New Signing Session' : 'Edit Session'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="min-w-[110px] text-right text-xs text-muted-foreground">
            {!targetSessionId
              ? 'Creating draft...'
              : autosaveStatus === 'saving'
                ? 'Saving...'
                : autosaveStatus === 'saved'
                  ? 'All changes saved'
                  : autosaveStatus === 'error'
                    ? 'Autosave failed'
                    : 'Draft'}
          </span>
          <Button
            onClick={handleContinue}
            disabled={
              documentsLoading ||
              createSession.isPending ||
              updateSession.isPending ||
              addRecipient.isPending ||
              updateRecipient.isPending ||
              removeRecipient.isPending
            }
          >
            {step < STEPS.length - 1 ? 'Next' : 'Continue to Field Editor'}
          </Button>
        </div>
      </div>

      <div className="flex border-b">
        {STEPS.map((stepName, index) => (
          <button
            key={stepName}
            onClick={() => setStep(index)}
            className={`flex-1 border-b-2 py-3 text-center text-sm font-medium transition-colors ${
              index === step
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {stepName}
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-5xl p-6">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label>Session Name / Email Subject</Label>
              <Input
                value={sessionName}
                onChange={(event) => setSessionName(event.target.value)}
                placeholder="e.g. Signing - 123 Main St"
              />
            </div>
            <div>
              <Label>Email Message</Label>
              <Textarea
                value={emailMessage}
                onChange={(event) => setEmailMessage(event.target.value)}
                rows={5}
                placeholder="Message to recipients..."
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Documents</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These are the documents that will be included in this signing session.
              </p>
            </div>
            {documentsLoading ? (
              <p className="text-sm text-muted-foreground">Loading selected documents...</p>
            ) : documentsForStep.length ? (
              <div className="space-y-2">
                {documentsForStep.map((document, index) => (
                  <div
                    key={`${document.checklistItemId}-${index}`}
                    className="flex items-center gap-2 rounded-xl border px-3 py-3"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{document.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        document.storage_path
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {document.storage_path ? 'Ready' : 'Needs linked PDF'}
                    </span>
                  </div>
                ))}
                {documentsForStep.some((document) => !document.storage_path) && (
                  <p className="text-xs text-muted-foreground">
                    Documents without a linked PDF will still be added to the session, but they
                    need a file before fields can be placed on them.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No documents were selected yet. Go back to the deal checklist and check the
                documents you want in this signing session.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Recipients ({recipients.length})
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Edit names, email addresses, recipient types, and drag to reorder when signing
                  order matters.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="signing-order" className="text-sm">
                  Set Recipient Order
                </Label>
                <Switch
                  id="signing-order"
                  checked={signingOrderEnabled}
                  onCheckedChange={setSigningOrderEnabled}
                />
              </div>
            </div>

            <div className="space-y-3">
              {recipients.map((recipient, index) => (
                <div
                  key={recipient.local_id}
                  draggable
                  onDragStart={() => setDraggedRecipientId(recipient.local_id)}
                  onDragEnd={() => {
                    setDraggedRecipientId(null);
                    setDragOverRecipientId(null);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverRecipientId(recipient.local_id);
                  }}
                  onDragLeave={() => {
                    if (dragOverRecipientId === recipient.local_id) {
                      setDragOverRecipientId(null);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (!draggedRecipientId) return;
                    moveRecipient(draggedRecipientId, recipient.local_id);
                    setDraggedRecipientId(null);
                    setDragOverRecipientId(null);
                  }}
                  className={`rounded-2xl border bg-muted/20 p-4 transition-colors ${
                    dragOverRecipientId === recipient.local_id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="grid gap-4 md:grid-cols-[auto_auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_180px_auto] md:items-end">
                    <div className="flex items-end justify-center pb-2 text-sm font-semibold text-muted-foreground">
                      {signingOrderEnabled ? index + 1 : ' '}
                    </div>
                    <div className="flex items-end justify-center pb-2">
                      <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        First Name
                      </Label>
                      <Input
                        value={recipient.first_name}
                        onChange={(event) =>
                          updateLocalRecipient(recipient.local_id, 'first_name', event.target.value)
                        }
                        placeholder="First name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Last Name
                      </Label>
                      <Input
                        value={recipient.last_name}
                        onChange={(event) =>
                          updateLocalRecipient(recipient.local_id, 'last_name', event.target.value)
                        }
                        placeholder="Last name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Email Address
                      </Label>
                      <Input
                        value={recipient.email}
                        onChange={(event) =>
                          updateLocalRecipient(recipient.local_id, 'email', event.target.value)
                        }
                        placeholder="name@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Type
                      </Label>
                      <Select
                        value={recipient.type}
                        onValueChange={(value) =>
                          updateLocalRecipient(recipient.local_id, 'type', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RECIPIENT_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => removeLocalRecipient(recipient.local_id)}
                        aria-label={`Remove ${getRecipientLabel(recipient)}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {dealPeople.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Add From Deal People
                </Label>
                <Select onValueChange={addFromDealPeople}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select someone already on this deal..." />
                  </SelectTrigger>
                  <SelectContent>
                    {dealPeople.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.first_name} {person.last_name} — {person.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-3 rounded-2xl border bg-muted/30 p-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Add New Recipient</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add someone manually if they are not already attached to the deal.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  value={newFirst}
                  onChange={(event) => setNewFirst(event.target.value)}
                  placeholder="First name"
                />
                <Input
                  value={newLast}
                  onChange={(event) => setNewLast(event.target.value)}
                  placeholder="Last name"
                />
              </div>
              <Input
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                placeholder="Email address"
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger className="sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECIPIENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={addLocalRecipient}>
                  <Plus className="mr-2 h-4 w-4" /> Add Recipient
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-foreground">Roles</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Suggested roles come from the people already on the deal. You can change both the
                role and the responsible party, or add extra custom roles when needed.
              </p>
            </div>

            {roleAssignments.length ? (
              <div className="space-y-3">
                {roleAssignments.map((roleAssignment) => (
                  <div
                    key={roleAssignment.id}
                    className="grid gap-4 rounded-2xl border bg-muted/20 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end"
                  >
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Role
                      </Label>
                      <Select
                        value={roleAssignment.role_option}
                        onValueChange={(value) =>
                          updateRoleAssignment(roleAssignment.id, {
                            role_option: value,
                            custom_role_name:
                              value === CUSTOM_ROLE_VALUE
                                ? roleAssignment.custom_role_name || 'Custom Role'
                                : '',
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoleOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                          <SelectItem value={CUSTOM_ROLE_VALUE}>Custom role</SelectItem>
                        </SelectContent>
                      </Select>
                      {roleAssignment.role_option === CUSTOM_ROLE_VALUE && (
                        <Input
                          value={roleAssignment.custom_role_name}
                          onChange={(event) =>
                            updateRoleAssignment(roleAssignment.id, {
                              custom_role_name: event.target.value,
                            })
                          }
                          placeholder="Custom role name"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Responsible Party
                      </Label>
                      <Select
                        value={roleAssignment.recipient_local_id || 'unassigned'}
                        onValueChange={(value) =>
                          updateRoleAssignment(roleAssignment.id, {
                            recipient_local_id: value === 'unassigned' ? null : value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {recipients.map((recipient) => (
                            <SelectItem key={recipient.local_id} value={recipient.local_id}>
                              {getRecipientLabel(recipient)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => removeRoleAssignment(roleAssignment.id)}
                        aria-label={`Remove ${getRoleName(roleAssignment)}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                Add recipients first, then assign roles and responsible parties here.
              </div>
            )}

            <Button variant="outline" onClick={addRoleAssignment} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Role
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-foreground">Settings</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Configure reminders and expiration for this signing session.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border p-4">
                <div>
                  <div className="text-sm font-medium">Auto Reminders</div>
                  <div className="text-xs text-muted-foreground">
                    Send periodic reminders to unsigned recipients
                  </div>
                </div>
                <Switch checked={enableReminders} onCheckedChange={setEnableReminders} />
              </div>
              {enableReminders && (
                <div className="pl-4">
                  <Label>Remind every (days)</Label>
                  <Input
                    type="number"
                    value={reminderDays}
                    onChange={(event) => setReminderDays(Number(event.target.value))}
                    className="w-24"
                    min={1}
                  />
                </div>
              )}

              <div className="flex items-center justify-between rounded-2xl border p-4">
                <div>
                  <div className="text-sm font-medium">Expiration</div>
                  <div className="text-xs text-muted-foreground">
                    Session expires after a set number of days
                  </div>
                </div>
                <Switch checked={enableExpiration} onCheckedChange={setEnableExpiration} />
              </div>
              {enableExpiration && (
                <div className="pl-4">
                  <Label>Expires in (days)</Label>
                  <Input
                    type="number"
                    value={expirationDays}
                    onChange={(event) => setExpirationDays(Number(event.target.value))}
                    className="w-24"
                    min={1}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
