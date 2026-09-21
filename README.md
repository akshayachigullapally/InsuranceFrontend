# Insurance Platform - Backend Services

A microservices-based insurance platform with comprehensive notification and financial management capabilities.

## Services Overview

### Notification Service (`notificationservice/`)
- **Real-time WebSocket/SSE notifications** via STOMP over SockJS
- **Multi-channel delivery**: In-app, Email, SMS
- **Notification templates** with variable substitution
- **Delivery retry mechanism** with configurable max retries
- **Batch notification sending** for admin users
- **Notification preferences** per user/type/channel
- **Audit event logging**
- **Scheduled cleanup** of old notifications
- **Default templates** for all notification types

### Financial Service (`financialservice/`)
- **Payment management**: Create, succeed, fail, refund, retry
- **Payout management**: Create, process, succeed, fail, retry
- **Quote management**: Create, accept, cancel, consume, validate
- **Pricing rules**: CRUD operations with activation/deactivation
- **Financial transactions** recording for audit trail
- **Reconciliation** daily automated reconciliation with notifications
- **Premium due/overdue scheduler** with automated notifications
- **Comprehensive notifications** for all financial events

### Claims Service (`claimsservice/`)
- **Claim lifecycle**: Submit, review, approve, reject, settle, cancel
- **Trigger eligibility validation** via Trigger Service
- **Duplicate claim prevention**
- **Claim timeline** tracking
- **Notifications** for all claim events

### Product Service (`productservice/`)
- **Product management**: Create, update, status changes
- **Policy management**: Create, approve, reject, cancel, expiry
- **Trigger snapshots** for parametric policies
- **Policy status history** tracking
- **Notifications** for all policy events

### Trigger Service (`triggerservice/`)
- **Trigger definitions** with peril, metric, threshold configuration
- **Trigger events** detection, validation, verification, processing
- **Observations** recording and validation
- **Perils** and **Location zones** management
- **Policy trigger eligibility** checking
- **Idempotency** for event processing
- **Notifications** for all trigger events

### Common Module (`common/`)
- **Shared DTOs**: NotificationRequest, AuditEventRequest, MessageResponse, InternalNotificationRequest, InternalAuditEventRequest

## Key Features

### Dynamic Notifications
- Real-time WebSocket delivery to connected clients
- Multi-channel support (In-app, Email, SMS)
- Template-based with variable substitution
- User preferences per notification type and channel
- Retry mechanism for failed deliveries
- Batch sending for admin announcements

### Financial Operations
- Complete payment and payout lifecycle
- Quote generation and management
- Automated reconciliation with discrepancy detection
- Premium due/overdue scheduling
- Pricing rule management

### Event-Driven Architecture
- All services publish audit events
- Cross-service notifications via Notification Service
- Internal API communication with gateway authentication
- Idempotent event processing

## Technology Stack
- **Java 21** / Spring Boot 3.x
- **Spring WebFlux** (Reactive)
- **Spring Data R2DBC** (PostgreSQL)
- **Spring WebSocket** (STOMP/SockJS)
- **Spring Mail** (Email delivery)
- **Spring Scheduling** (Cron jobs)
- **Project Lombok** (Boilerplate reduction)
- **Maven** (Build management)

## Getting Started

### Prerequisites
- Java 21+
- Maven 3.9+
- PostgreSQL 15+
- Redis (for session/caching)

### Configuration
Each service has `application.yaml` with:
- Database connection
- Service URLs (for inter-service communication)
- Gateway internal key
- Email/SMS provider settings
- Notification settings

### Building
```bash
mvn clean install -DskipTests
```

### Running Services
```bash
# Start each service
java -jar notificationservice/target/notificationservice-*.jar
java -jar financialservice/target/financialservice-*.jar
java -jar claimsservice/target/claimsservice-*.jar
java -jar productservice/target/productservice-*.jar
java -jar triggerservice/target/triggerservice-*.jar
```

## Notification Types

### Policy
- POLICY_SUBMITTED, POLICY_APPROVED, POLICY_REJECTED, POLICY_CANCELLED, POLICY_EXPIRED, POLICY_RENEWAL_DUE

### Claim
- CLAIM_SUBMITTED, CLAIM_UNDER_REVIEW, CLAIM_APPROVED, CLAIM_REJECTED, CLAIM_SETTLED, CLAIM_CANCELLED
- CLAIM_DOCUMENT_REQUESTED, CLAIM_REMINDER, CLAIM_ESCALATED, CLAIM_PAYMENT_INITIATED

### Trigger
- TRIGGER_DETECTED, TRIGGER_VERIFIED, TRIGGER_REJECTED, TRIGGER_PROCESSED
- OBSERVATION_CREATED, PERIL_CREATED, TRIGGER_DEFINITION_CREATED, LOCATION_ZONE_CREATED

### Financial
- PAYMENT_SUCCESS, PAYMENT_FAILED, PAYMENT_PENDING, PAYMENT_RETRY, PAYMENT_REFUNDED
- PAYOUT_PROCESSED, PAYOUT_FAILED, PAYOUT_PENDING, PAYOUT_RETRY
- QUOTE_CREATED, QUOTE_EXPIRED, QUOTE_CONSUMED
- PREMIUM_DUE, PREMIUM_OVERDUE
- REFUND_PROCESSED, REFUND_FAILED
- RECONCILIATION_COMPLETED, RECONCILIATION_DISCREPANCY
- PRICING_RULE_CREATED, PRICING_RULE_UPDATED

## API Endpoints

### Notification Service
- `POST /internal/notifications` - Create notification (internal)
- `POST /internal/audit-events` - Create audit event (internal)
- `GET /api/notifications/me` - Get user notifications
- `GET /api/notifications/me/unread` - Get unread notifications
- `GET /api/notifications/me/unread-count` - Get unread count
- `PUT /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/me/read-all` - Mark all as read
- `DELETE /api/notifications/{id}` - Delete notification
- `GET /api/notifications/me/preferences` - Get preferences
- `PUT /api/notifications/me/preferences` - Update preferences
- `POST /api/notifications/from-template` - Create from template
- `POST /api/notifications/admin/batch` - Send batch (admin)
- `GET /api/notifications/admin/templates` - List templates (admin)
- `POST /api/notifications/admin/templates` - Create template (admin)
- `WS /ws/notifications` - WebSocket endpoint

### Financial Service
- `POST /api/quotes` - Create quote
- `GET /api/quotes/me` - Get user quotes
- `POST /api/quotes/{id}/accept` - Accept quote
- `POST /api/quotes/{id}/cancel` - Cancel quote
- `POST /api/payments` - Create payment
- `GET /api/payments/me` - Get user payments
- `POST /api/payments/{id}/success` - Mark payment success
- `POST /api/payments/{id}/fail` - Mark payment failed
- `POST /api/payments/{id}/refund` - Refund payment
- `POST /api/payments/{id}/retry` - Retry payment
- `POST /api/payouts` - Create payout (admin)
- `GET /api/payouts/me` - Get user payouts
- `POST /api/payouts/{id}/process` - Process payout
- `POST /api/payouts/{id}/success` - Mark payout success
- `POST /api/payouts/{id}/fail` - Mark payout failed
- `POST /api/payouts/{id}/retry` - Retry payout

### Claims Service
- `POST /api/claims` - Create claim
- `GET /api/claims/me` - Get user claims
- `GET /api/claims/me/{id}` - Get user claim details
- `POST /api/claims/{id}/cancel` - Cancel claim
- `GET /api/claims/admin/submitted` - Get submitted claims (admin)
- `POST /api/claims/admin/{id}/review` - Start review
- `POST /api/claims/admin/{id}/approve` - Approve claim
- `POST /api/claims/admin/{id}/reject` - Reject claim
- `POST /api/claims/admin/{id}/settle` - Settle claim

### Product Service
- `POST /api/products` - Create product (admin)
- `GET /api/products` - List products
- `PUT /api/products/{id}/status` - Update product status (admin)
- `POST /api/policies` - Create policy
- `GET /api/policies/me` - Get user policies
- `POST /api/policies/{id}/cancel` - Cancel policy
- `GET /api/policies/admin/pending` - Get pending policies (admin)
- `POST /api/policies/admin/{id}/approve` - Approve policy
- `POST /api/policies/admin/{id}/reject` - Reject policy

### Trigger Service
- `POST /api/triggers/definitions` - Create trigger definition
- `GET /api/triggers/definitions` - List trigger definitions
- `POST /api/triggers/events` - Create trigger event
- `GET /api/triggers/events` - List trigger events
- `POST /api/triggers/events/{id}/validate` - Start validation
- `POST /api/triggers/events/{id}/verify` - Verify event
- `POST /api/triggers/events/{id}/reject` - Reject event
- `POST /api/triggers/events/{id}/process` - Process event
- `POST /api/perils` - Create peril
- `POST /api/zones` - Create location zone