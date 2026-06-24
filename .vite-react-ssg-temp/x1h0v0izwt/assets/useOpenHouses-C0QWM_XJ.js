import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { s as supabase } from "../main.mjs";
function useOpenHouses(dealId) {
  return useQuery({
    queryKey: ["open_houses", dealId],
    queryFn: async () => {
      let q = supabase.from("open_houses").select("*").order("scheduled_date", { ascending: true });
      if (dealId) q = q.eq("deal_id", dealId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    }
  });
}
function useCreateOpenHouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (oh) => {
      const { data, error } = await supabase.from("open_houses").insert(oh).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["open_houses"] })
  });
}
export {
  useCreateOpenHouse as a,
  useOpenHouses as u
};
