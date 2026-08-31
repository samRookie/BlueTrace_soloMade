CREATE TABLE "blue_carbon_projects" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(64) NOT NULL,
	"ecosystem_type" varchar(64) NOT NULL,
	"estimated_hectares" numeric(12, 2) NOT NULL,
	"target_co2_sequester_tpy" numeric(12, 2),
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blue_carbon_projects_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "disputes" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"project_id" varchar(64) NOT NULL,
	"lifecycle_status" varchar(32) DEFAULT 'DRAFT' NOT NULL,
	"visibility" varchar(32) DEFAULT 'INTERNAL' NOT NULL,
	"resolution_summary" text,
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_items" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" varchar(64) NOT NULL,
	"source_id" varchar(64) NOT NULL,
	"project_id" varchar(64),
	"policy_id" varchar(64),
	"lifecycle_status" varchar(32) DEFAULT 'PUBLISHED' NOT NULL,
	"integrity_status" varchar(32) DEFAULT 'VERIFIED' NOT NULL,
	"visibility" varchar(32) DEFAULT 'PUBLIC' NOT NULL,
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_relationships" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"source_evidence_id" varchar(64) NOT NULL,
	"target_evidence_id" varchar(64) NOT NULL,
	"relationship_type" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evidence_rel_no_self_loop" CHECK ("evidence_relationships"."source_evidence_id" <> "evidence_relationships"."target_evidence_id")
);
--> statement-breakpoint
CREATE TABLE "gis_layers" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"layer_type" varchar(64) NOT NULL,
	"region_id" varchar(64) NOT NULL,
	"source_id" varchar(64),
	"visibility" varchar(32) DEFAULT 'PUBLIC' NOT NULL,
	"status" varchar(32) DEFAULT 'PUBLISHED' NOT NULL,
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indicators" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"code" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"category" varchar(64) NOT NULL,
	"unit" varchar(32) NOT NULL,
	"policy_id" varchar(64),
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "indicators_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "innovation_opportunities" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"project_id" varchar(64) NOT NULL,
	"policy_id" varchar(64),
	"status" varchar(32) DEFAULT 'DRAFT' NOT NULL,
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrity_records" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"verification_id" varchar(64) NOT NULL,
	"checksum" varchar(128) NOT NULL,
	"algorithm" varchar(32) DEFAULT 'SHA-256' NOT NULL,
	"integrity_status" varchar(32) DEFAULT 'VERIFIED' NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "integrity_records_verification_id_unique" UNIQUE("verification_id")
);
--> statement-breakpoint
CREATE TABLE "mrv_records" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"blue_carbon_project_id" varchar(64) NOT NULL,
	"reporting_period_start" timestamp with time zone NOT NULL,
	"reporting_period_end" timestamp with time zone NOT NULL,
	"measured_biomass_density" numeric(10, 4),
	"estimated_sequestration_tonnes" numeric(12, 2) NOT NULL,
	"status" varchar(32) DEFAULT 'DRAFT' NOT NULL,
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mrv_period_check" CHECK ("mrv_records"."reporting_period_start" <= "mrv_records"."reporting_period_end")
);
--> statement-breakpoint
CREATE TABLE "policies" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"code" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"lifecycle_status" varchar(32) DEFAULT 'DRAFT' NOT NULL,
	"visibility" varchar(32) DEFAULT 'PUBLIC' NOT NULL,
	"region_id" varchar(64),
	"source_id" varchar(64),
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "policies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"code" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"region_id" varchar(64) NOT NULL,
	"workspace_id" varchar(64),
	"lifecycle_status" varchar(32) DEFAULT 'DRAFT' NOT NULL,
	"visibility" varchar(32) DEFAULT 'PUBLIC' NOT NULL,
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"code" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"level" varchar(32) NOT NULL,
	"parent_code" varchar(64),
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "regions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"source_type" varchar(32) NOT NULL,
	"publisher" text,
	"uri" text,
	"attribution" text,
	"obtained_at" timestamp with time zone,
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_records" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"mrv_id" varchar(64) NOT NULL,
	"verifier_identity" text NOT NULL,
	"verification_status" varchar(32) DEFAULT 'UNVERIFIED' NOT NULL,
	"verified_at" timestamp with time zone,
	"methodology" text NOT NULL,
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"visibility" varchar(32) DEFAULT 'INTERNAL' NOT NULL,
	"owner_id" varchar(64) NOT NULL,
	"owner_type" varchar(32) DEFAULT 'INSTITUTION' NOT NULL,
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blue_carbon_projects" ADD CONSTRAINT "blue_carbon_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_items" ADD CONSTRAINT "evidence_items_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_items" ADD CONSTRAINT "evidence_items_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_items" ADD CONSTRAINT "evidence_items_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_relationships" ADD CONSTRAINT "evidence_relationships_source_evidence_id_evidence_items_id_fk" FOREIGN KEY ("source_evidence_id") REFERENCES "public"."evidence_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_relationships" ADD CONSTRAINT "evidence_relationships_target_evidence_id_evidence_items_id_fk" FOREIGN KEY ("target_evidence_id") REFERENCES "public"."evidence_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gis_layers" ADD CONSTRAINT "gis_layers_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gis_layers" ADD CONSTRAINT "gis_layers_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "innovation_opportunities" ADD CONSTRAINT "innovation_opportunities_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "innovation_opportunities" ADD CONSTRAINT "innovation_opportunities_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrity_records" ADD CONSTRAINT "integrity_records_verification_id_verification_records_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."verification_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mrv_records" ADD CONSTRAINT "mrv_records_blue_carbon_project_id_blue_carbon_projects_id_fk" FOREIGN KEY ("blue_carbon_project_id") REFERENCES "public"."blue_carbon_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_records" ADD CONSTRAINT "verification_records_mrv_id_mrv_records_id_fk" FOREIGN KEY ("mrv_id") REFERENCES "public"."mrv_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blue_carbon_project_idx" ON "blue_carbon_projects" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "disputes_project_idx" ON "disputes" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "disputes_status_idx" ON "disputes" USING btree ("lifecycle_status");--> statement-breakpoint
CREATE INDEX "evidence_source_idx" ON "evidence_items" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "evidence_project_idx" ON "evidence_items" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "evidence_policy_idx" ON "evidence_items" USING btree ("policy_id");--> statement-breakpoint
CREATE UNIQUE INDEX "evidence_rel_unique_idx" ON "evidence_relationships" USING btree ("source_evidence_id","target_evidence_id","relationship_type");--> statement-breakpoint
CREATE INDEX "gis_layers_region_idx" ON "gis_layers" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "indicators_policy_idx" ON "indicators" USING btree ("policy_id");--> statement-breakpoint
CREATE INDEX "indicators_category_idx" ON "indicators" USING btree ("category");--> statement-breakpoint
CREATE INDEX "innovation_project_idx" ON "innovation_opportunities" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "innovation_policy_idx" ON "innovation_opportunities" USING btree ("policy_id");--> statement-breakpoint
CREATE INDEX "integrity_verification_idx" ON "integrity_records" USING btree ("verification_id");--> statement-breakpoint
CREATE INDEX "mrv_blue_carbon_idx" ON "mrv_records" USING btree ("blue_carbon_project_id");--> statement-breakpoint
CREATE INDEX "policies_region_idx" ON "policies" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "policies_status_idx" ON "policies" USING btree ("lifecycle_status");--> statement-breakpoint
CREATE INDEX "projects_region_idx" ON "projects" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "projects_workspace_idx" ON "projects" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("lifecycle_status");--> statement-breakpoint
CREATE INDEX "regions_level_idx" ON "regions" USING btree ("level");--> statement-breakpoint
CREATE INDEX "regions_parent_code_idx" ON "regions" USING btree ("parent_code");--> statement-breakpoint
CREATE INDEX "sources_type_idx" ON "sources" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "sources_sample_idx" ON "sources" USING btree ("sample_flag");--> statement-breakpoint
CREATE INDEX "verification_mrv_idx" ON "verification_records" USING btree ("mrv_id");--> statement-breakpoint
CREATE INDEX "verification_status_idx" ON "verification_records" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "workspaces_owner_idx" ON "workspaces" USING btree ("owner_id","owner_type");