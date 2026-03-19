
-- Seed contacts
INSERT INTO public.contacts (id, first_name, last_name, email, phone, company, role, current_address, mls_id, mls, commission, commission_type, tags, last_touch, next_touch) VALUES
('a1000000-0000-0000-0000-000000000001', 'John', 'Smith', 'john@realty.com', '(555) 123-4567', 'ABC Realty', 'Seller Agent', NULL, 'AGT001', 'MFRMLS', '3', 'percentage', ARRAY['Agent'], '2026-03-15'::timestamptz, '2026-04-01'::timestamptz),
('a1000000-0000-0000-0000-000000000002', 'Homer', 'Simpson', 'homer@email.com', '(555) 987-6543', '', 'Seller', '742 Evergreen Terrace, Springfield IL', NULL, NULL, NULL, NULL, ARRAY['Seller'], '2026-03-10'::timestamptz, NULL),
('a1000000-0000-0000-0000-000000000003', 'Sarah', 'Johnson', 'sarah@homes.com', '(555) 234-5678', 'Premier Homes', 'Buyer Agent', NULL, 'AGT002', 'BRIGHTMLS', '2.5', 'percentage', ARRAY['Agent'], '2026-02-20'::timestamptz, '2026-03-25'::timestamptz),
('a1000000-0000-0000-0000-000000000004', 'Michael', 'Chen', 'michael.chen@gmail.com', '(555) 345-6789', 'Chen Industries', 'Buyer', '456 Oak Ave, Miami FL', NULL, NULL, NULL, NULL, ARRAY['Buyer','Lead'], '2026-03-01'::timestamptz, '2026-03-20'::timestamptz),
('a1000000-0000-0000-0000-000000000005', 'Emily', 'Davis', 'emily.d@outlook.com', '(555) 456-7890', 'Davis Corp', 'Seller', '789 Pine St, Austin TX', NULL, NULL, NULL, NULL, ARRAY['Seller'], '2026-02-15'::timestamptz, '2026-03-30'::timestamptz),
('a1000000-0000-0000-0000-000000000006', 'Robert', 'Wilson', 'rwilson@realestate.com', '(555) 567-8901', 'Wilson & Associates', 'Buyer Agent', NULL, 'AGT003', 'CRMLS', '3', 'percentage', ARRAY['Agent'], '2026-03-18'::timestamptz, '2026-04-05'::timestamptz),
('a1000000-0000-0000-0000-000000000007', 'Jennifer', 'Martinez', 'jen.martinez@yahoo.com', '(555) 678-9012', '', 'Buyer', '321 Elm Dr, Denver CO', NULL, NULL, NULL, NULL, ARRAY['Buyer','Lead'], '2026-01-20'::timestamptz, '2026-03-22'::timestamptz),
('a1000000-0000-0000-0000-000000000008', 'David', 'Brown', 'dbrown@company.com', '(555) 789-0123', 'Brown Developments', 'Seller', '555 Maple Ln, Seattle WA', NULL, NULL, NULL, NULL, ARRAY['Seller','VIP'], '2026-03-12'::timestamptz, '2026-04-10'::timestamptz),
('a1000000-0000-0000-0000-000000000009', 'Lisa', 'Anderson', 'lisa.a@gmail.com', '(555) 890-1234', '', 'Buyer', '100 Cedar Ct, Portland OR', NULL, NULL, NULL, NULL, ARRAY['Buyer'], '2026-02-28'::timestamptz, NULL),
('a1000000-0000-0000-0000-000000000010', 'James', 'Taylor', 'jtaylor@brokers.com', '(555) 901-2345', 'Taylor Brokers', 'Listing Agent', NULL, 'AGT004', 'NWMLS', '2.75', 'percentage', ARRAY['Agent'], '2026-03-05'::timestamptz, '2026-03-28'::timestamptz),
('a1000000-0000-0000-0000-000000000011', 'Amanda', 'White', 'awhite@email.com', '(555) 012-3456', '', 'Buyer', '200 Birch Rd, Chicago IL', NULL, NULL, NULL, NULL, ARRAY['Buyer','Lead'], '2026-03-17'::timestamptz, '2026-04-02'::timestamptz),
('a1000000-0000-0000-0000-000000000012', 'Christopher', 'Lee', 'clee@investments.com', '(555) 111-2222', 'Lee Investments', 'Seller', '400 Walnut St, Boston MA', NULL, NULL, NULL, NULL, ARRAY['Seller','VIP'], '2026-03-14'::timestamptz, '2026-04-08'::timestamptz),
('a1000000-0000-0000-0000-000000000013', 'Megan', 'Harris', 'mharris@realty.com', '(555) 333-4444', 'Harris Realty Group', 'Seller Agent', NULL, 'AGT005', 'MFRMLS', '3', 'percentage', ARRAY['Agent'], '2026-03-16'::timestamptz, '2026-04-03'::timestamptz),
('a1000000-0000-0000-0000-000000000014', 'Daniel', 'Clark', 'dclark@mail.com', '(555) 555-6666', '', 'Buyer', '600 Spruce Way, San Diego CA', NULL, NULL, NULL, NULL, ARRAY['Buyer'], '2026-02-10'::timestamptz, '2026-03-25'::timestamptz),
('a1000000-0000-0000-0000-000000000015', 'Rachel', 'Lewis', 'rlewis@outlook.com', '(555) 777-8888', 'Lewis & Co', 'Seller', '800 Ash Blvd, Phoenix AZ', NULL, NULL, NULL, NULL, ARRAY['Seller','Lead'], '2026-03-19'::timestamptz, '2026-04-15'::timestamptz);

-- Seed deals
INSERT INTO public.deals (id, property_type, address, city, state, zip, representation_side, status, price, mls_number, listing_start_date, listing_expiration, primary_agent) VALUES
('b1000000-0000-0000-0000-000000000001', 'Sale-Single Family Home', '742 Evergreen Terrace', 'Springfield', 'IL', '62704', 'seller', 'active', '$450,000', 'MLS-2024-001', '2026-01-15', '2026-07-15', 'John Smith'),
('b1000000-0000-0000-0000-000000000002', 'Sale-Condo', '1600 Pennsylvania Avenue', 'Washington', 'DC', '20500', 'buyer', 'pending', '$1,200,000', 'MLS-2024-002', '2026-02-01', '2026-08-01', 'Sarah Johnson'),
('b1000000-0000-0000-0000-000000000003', 'Sale-Land', '100 Oak Street', 'Miami', 'FL', '33101', 'both', 'draft', '$850,000', NULL, NULL, NULL, 'Unassigned');

-- Seed deal_contacts
INSERT INTO public.deal_contacts (deal_id, contact_id, role) VALUES
('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Seller Agent'),
('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'Seller'),
('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'Buyer Agent');

-- Seed checklist_items
INSERT INTO public.checklist_items (deal_id, name, has_digital_form, sort_order) VALUES
('b1000000-0000-0000-0000-000000000001', 'Exclusive Right of Sale Listing Agreement', true, 0),
('b1000000-0000-0000-0000-000000000001', 'Tax Roll', false, 1),
('b1000000-0000-0000-0000-000000000001', 'Lead-Based Paint Pamphlet', false, 2),
('b1000000-0000-0000-0000-000000000001', 'Sellers Property Disclosure - Residential', true, 3),
('b1000000-0000-0000-0000-000000000001', 'Affiliated Business Arrangement Disclosure Statement (Seller)', true, 4),
('b1000000-0000-0000-0000-000000000001', 'P. Lead Based Paint Disclosure (Pre 1978 Housing)', true, 5),
('b1000000-0000-0000-0000-000000000001', 'Compensation Agreement - Owner/Listing Broker to Tenants Broker', true, 6),
('b1000000-0000-0000-0000-000000000001', 'Compensation Agreement - Seller or Sellers Broker to Buyers Broker', true, 7),
('b1000000-0000-0000-0000-000000000001', 'Modification to Compensation Agreement - Seller or Sellers Broker to Buyers Broker', true, 8),
('b1000000-0000-0000-0000-000000000002', 'Exclusive Right of Sale Listing Agreement', true, 0),
('b1000000-0000-0000-0000-000000000002', 'Tax Roll', false, 1),
('b1000000-0000-0000-0000-000000000002', 'Lead-Based Paint Pamphlet', false, 2),
('b1000000-0000-0000-0000-000000000002', 'Sellers Property Disclosure - Residential', true, 3),
('b1000000-0000-0000-0000-000000000002', 'Affiliated Business Arrangement Disclosure Statement (Seller)', true, 4),
('b1000000-0000-0000-0000-000000000002', 'P. Lead Based Paint Disclosure (Pre 1978 Housing)', true, 5),
('b1000000-0000-0000-0000-000000000002', 'Compensation Agreement - Owner/Listing Broker to Tenants Broker', true, 6),
('b1000000-0000-0000-0000-000000000002', 'Compensation Agreement - Seller or Sellers Broker to Buyers Broker', true, 7),
('b1000000-0000-0000-0000-000000000002', 'Modification to Compensation Agreement - Seller or Sellers Broker to Buyers Broker', true, 8),
('b1000000-0000-0000-0000-000000000003', 'Exclusive Right of Sale Listing Agreement', true, 0),
('b1000000-0000-0000-0000-000000000003', 'Tax Roll', false, 1),
('b1000000-0000-0000-0000-000000000003', 'Lead-Based Paint Pamphlet', false, 2),
('b1000000-0000-0000-0000-000000000003', 'Sellers Property Disclosure - Residential', true, 3),
('b1000000-0000-0000-0000-000000000003', 'Affiliated Business Arrangement Disclosure Statement (Seller)', true, 4),
('b1000000-0000-0000-0000-000000000003', 'P. Lead Based Paint Disclosure (Pre 1978 Housing)', true, 5),
('b1000000-0000-0000-0000-000000000003', 'Compensation Agreement - Owner/Listing Broker to Tenants Broker', true, 6),
('b1000000-0000-0000-0000-000000000003', 'Compensation Agreement - Seller or Sellers Broker to Buyers Broker', true, 7),
('b1000000-0000-0000-0000-000000000003', 'Modification to Compensation Agreement - Seller or Sellers Broker to Buyers Broker', true, 8);
