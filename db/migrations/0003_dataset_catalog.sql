CREATE TABLE "dataset_metadata" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"evidence_id" varchar(64) NOT NULL,
	"dataset_type" varchar(32) NOT NULL,
	"technical_format" varchar(32) NOT NULL,
	"update_frequency" varchar(32) NOT NULL,
	"access_level" varchar(32) DEFAULT 'OPEN' NOT NULL,
	"spatial_coverage_summary" text,
	"temporal_coverage_start" timestamp with time zone,
	"temporal_coverage_end" timestamp with time zone,
	"period_type" varchar(32),
	"region_id" varchar(64),
	"gis_layer_id" varchar(64),
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dataset_metadata_evidence_id_unique" UNIQUE("evidence_id")
);
--> statement-breakpoint
ALTER TABLE "dataset_metadata" ADD CONSTRAINT "dataset_metadata_evidence_id_evidence_items_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dataset_metadata" ADD CONSTRAINT "dataset_metadata_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dataset_metadata" ADD CONSTRAINT "dataset_metadata_gis_layer_id_gis_layers_id_fk" FOREIGN KEY ("gis_layer_id") REFERENCES "public"."gis_layers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dataset_metadata_evidence_idx" ON "dataset_metadata" USING btree ("evidence_id");--> statement-breakpoint
CREATE INDEX "dataset_metadata_type_idx" ON "dataset_metadata" USING btree ("dataset_type");--> statement-breakpoint
CREATE INDEX "dataset_metadata_format_idx" ON "dataset_metadata" USING btree ("technical_format");--> statement-breakpoint
CREATE INDEX "dataset_metadata_access_idx" ON "dataset_metadata" USING btree ("access_level");--> statement-breakpoint
CREATE INDEX "dataset_metadata_frequency_idx" ON "dataset_metadata" USING btree ("update_frequency");--> statement-breakpoint
CREATE INDEX "dataset_metadata_region_idx" ON "dataset_metadata" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "dataset_metadata_gis_idx" ON "dataset_metadata" USING btree ("gis_layer_id");
