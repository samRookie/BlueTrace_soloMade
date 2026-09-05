ALTER TABLE "gis_layers" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "gis_layers" ADD COLUMN "geometry_type" varchar(32) DEFAULT 'Polygon' NOT NULL;--> statement-breakpoint
ALTER TABLE "gis_layers" ADD COLUMN "period" varchar(64);--> statement-breakpoint
ALTER TABLE "gis_layers" ADD COLUMN "coverage" text;--> statement-breakpoint
ALTER TABLE "gis_layers" ADD COLUMN "legend" jsonb;--> statement-breakpoint
CREATE INDEX "gis_layers_visibility_idx" ON "gis_layers" USING btree ("visibility");--> statement-breakpoint
CREATE TABLE "gis_features" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"layer_id" varchar(64) NOT NULL,
	"region_id" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"geometry_type" varchar(32) NOT NULL,
	"geometry" jsonb NOT NULL,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"evidence_id" varchar(64),
	"dataset_id" varchar(64),
	"project_id" varchar(64),
	"policy_id" varchar(64),
	"indicator_id" varchar(64),
	"dispute_id" varchar(64),
	"visibility" varchar(32) DEFAULT 'PUBLIC' NOT NULL,
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "gis_features" ADD CONSTRAINT "gis_features_layer_id_gis_layers_id_fk" FOREIGN KEY ("layer_id") REFERENCES "public"."gis_layers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gis_features" ADD CONSTRAINT "gis_features_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gis_features" ADD CONSTRAINT "gis_features_evidence_id_evidence_items_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gis_features" ADD CONSTRAINT "gis_features_dataset_id_dataset_metadata_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."dataset_metadata"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gis_features" ADD CONSTRAINT "gis_features_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gis_features" ADD CONSTRAINT "gis_features_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gis_features" ADD CONSTRAINT "gis_features_indicator_id_indicators_id_fk" FOREIGN KEY ("indicator_id") REFERENCES "public"."indicators"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gis_features" ADD CONSTRAINT "gis_features_dispute_id_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."disputes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gis_features_layer_idx" ON "gis_features" USING btree ("layer_id");--> statement-breakpoint
CREATE INDEX "gis_features_region_idx" ON "gis_features" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "gis_features_visibility_idx" ON "gis_features" USING btree ("visibility");
