CREATE TABLE "evidence_attachments" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"evidence_id" varchar(64) NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(128) NOT NULL,
	"storage_key" varchar(255) NOT NULL,
	"checksum_sha256" varchar(64),
	"sample_flag" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evidence_attachments_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
ALTER TABLE "evidence_attachments" ADD CONSTRAINT "evidence_attachments_evidence_id_evidence_items_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "evidence_attachments_evidence_idx" ON "evidence_attachments" USING btree ("evidence_id");--> statement-breakpoint
CREATE INDEX "evidence_attachments_storage_idx" ON "evidence_attachments" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "evidence_category_idx" ON "evidence_items" USING btree ("category");--> statement-breakpoint
CREATE INDEX "evidence_lifecycle_idx" ON "evidence_items" USING btree ("lifecycle_status");--> statement-breakpoint
CREATE INDEX "evidence_integrity_idx" ON "evidence_items" USING btree ("integrity_status");--> statement-breakpoint
CREATE INDEX "evidence_visibility_idx" ON "evidence_items" USING btree ("visibility");
