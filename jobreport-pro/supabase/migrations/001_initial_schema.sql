-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  company_name text,
  company_logo text,
  address text,
  phone text,
  business_email text,
  license_number text,
  tax_id text,
  default_tax_rate decimal(5,2) default 0,
  default_payment_terms text default 'Net 30',
  invoice_prefix text default 'INV-',
  invoice_next_number int default 1,
  stripe_customer_id text,
  subscription_status text default 'free',
  subscription_plan text,
  subscription_ends_at timestamptz,
  documents_used_this_month int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies for profiles
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Create documents table
create table documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  document_type text not null,
  document_number text not null,
  status text default 'draft',
  client_name text,
  client_email text,
  client_phone text,
  client_address text,
  job_location text,
  job_title text,
  data jsonb not null,
  photos jsonb,
  notes text,
  total_amount decimal(10,2),
  pdf_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  due_date date,
  paid_date date,
  sent_date date
);

-- Indexes
create index idx_documents_user_id on documents(user_id);
create index idx_documents_type on documents(document_type);
create index idx_documents_status on documents(status);
create index idx_documents_created_at on documents(created_at desc);

-- Enable RLS
alter table documents enable row level security;

-- Policies for documents
create policy "Users can view own documents"
  on documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on documents for update
  using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on documents for delete
  using (auth.uid() = user_id);

-- Create clients table
create table clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for client search
create index idx_clients_user_id on clients(user_id);
create index idx_clients_name on clients(name);

-- Enable RLS
alter table clients enable row level security;

-- Policies for clients
create policy "Users can manage own clients"
  on clients for all
  using (auth.uid() = user_id);

-- Create stripe_events table
create table stripe_events (
  id uuid default gen_random_uuid() primary key,
  event_id text unique not null,
  type text not null,
  data jsonb not null,
  processed boolean default false,
  created_at timestamptz default now()
);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

create trigger update_documents_updated_at
  before update on documents
  for each row
  execute function update_updated_at_column();

create trigger update_clients_updated_at
  before update on clients
  for each row
  execute function update_updated_at_column();
