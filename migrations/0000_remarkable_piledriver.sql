CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar NOT NULL,
	"details" jsonb,
	"ip_address" varchar,
	"user_agent" varchar,
	"success" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"platform" varchar NOT NULL,
	"version" varchar NOT NULL,
	"downloaded_at" timestamp DEFAULT now(),
	"ip_address" varchar
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripe_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_event_id" varchar NOT NULL,
	"event_type" varchar NOT NULL,
	"event_data" jsonb NOT NULL,
	"processed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "stripe_webhook_events_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"price" integer NOT NULL,
	"stripe_price_id" varchar,
	"features" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "subscription_plans_stripe_price_id_unique" UNIQUE("stripe_price_id")
);
--> statement-breakpoint
CREATE TABLE "usage_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" timestamp DEFAULT now(),
	"session_duration" integer,
	"focus_sessions" integer,
	"blink_count" integer,
	"posture_alerts" integer,
	"screen_time" integer,
	"rest_breaks_taken" integer,
	"ergonomic_score" real,
	"ai_interactions" integer,
	"productivity_score" real,
	"eye_strain_level" integer,
	"posture_quality" integer,
	"stress_level" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"stripe_subscription_id" varchar,
	"status" varchar NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"trial_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"last_payment_date" timestamp,
	"next_billing_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar,
	"google_id" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"is_email_verified" boolean DEFAULT false,
	"stripe_customer_id" varchar,
	"two_factor_secret" varchar,
	"last_login_at" timestamp,
	"login_attempts" integer DEFAULT 0,
	"is_locked" boolean DEFAULT false,
	"lock_expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_stats" ADD CONSTRAINT "usage_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_audit_logs_user_action" ON "audit_logs" USING btree ("user_id","action","created_at");--> statement-breakpoint
CREATE INDEX "IDX_audit_logs_action_date" ON "audit_logs" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "IDX_downloads_platform_date" ON "downloads" USING btree ("platform","downloaded_at");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "IDX_webhook_events_type" ON "stripe_webhook_events" USING btree ("event_type","processed");--> statement-breakpoint
CREATE INDEX "IDX_usage_stats_user_date" ON "usage_stats" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "IDX_usage_stats_health" ON "usage_stats" USING btree ("ergonomic_score","productivity_score");--> statement-breakpoint
CREATE INDEX "IDX_user_subscriptions_status" ON "user_subscriptions" USING btree ("user_id","status","end_date");--> statement-breakpoint
CREATE INDEX "IDX_user_subscriptions_period" ON "user_subscriptions" USING btree ("current_period_start","current_period_end");--> statement-breakpoint
CREATE INDEX "IDX_users_email_verified" ON "users" USING btree ("email","is_email_verified");--> statement-breakpoint
CREATE INDEX "IDX_users_google_id" ON "users" USING btree ("google_id");