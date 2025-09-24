-- Optimized indexes for ShipSmart tracking microservice
-- These indexes are designed for high-volume tracking operations

-- Primary indexes for tracking_events table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_events_tracking_number_carrier 
ON tracking_events (tracking_number, carrier_code);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_events_latest_status 
ON tracking_events (tracking_number, carrier_code, is_latest) 
WHERE is_latest = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_events_timestamp_desc 
ON tracking_events (event_timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_events_status_timestamp 
ON tracking_events (status, event_timestamp DESC);

-- Composite index for batch queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_events_batch_lookup 
ON tracking_events (carrier_code, tracking_number, event_timestamp DESC);

-- Index for location-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_events_location 
ON tracking_events USING gin(to_tsvector('english', location)) 
WHERE location IS NOT NULL;

-- Geospatial index for coordinates
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_events_coordinates 
ON tracking_events (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Index for external event ID lookups (deduplication)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_events_external_id 
ON tracking_events (carrier_code, external_event_id) 
WHERE external_event_id IS NOT NULL;

-- Partial index for delivered shipments
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_events_delivered 
ON tracking_events (tracking_number, carrier_code, event_timestamp DESC) 
WHERE status = 'DELIVERED';

-- Primary indexes for carrier_keys table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_carrier_keys_active 
ON carrier_keys (carrier_code, is_active) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_carrier_keys_type_active 
ON carrier_keys (carrier_type, is_active) 
WHERE is_active = true;

-- Index for usage tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_carrier_keys_usage 
ON carrier_keys (last_used_at DESC, usage_count DESC) 
WHERE is_active = true;

-- Index for expiration monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_carrier_keys_expiry 
ON carrier_keys (expires_at) 
WHERE expires_at IS NOT NULL AND is_active = true;

-- Analyze tables for query optimization
ANALYZE tracking_events;
ANALYZE carrier_keys;
