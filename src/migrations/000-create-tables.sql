-- Initial database schema for ShipSmart tracking microservice

-- Create carrier_keys table
CREATE TABLE IF NOT EXISTS carrier_keys (
    id SERIAL PRIMARY KEY,
    carrier_code VARCHAR(20) NOT NULL,
    carrier_type VARCHAR(50) NOT NULL,
    carrier_name VARCHAR(255) NOT NULL,
    api_key TEXT NOT NULL,
    api_secret TEXT,
    base_url VARCHAR(500) NOT NULL,
    tracking_number_pattern VARCHAR(255),
    rate_limit_per_minute INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(carrier_code)
);

-- Create tracking_events table
CREATE TABLE IF NOT EXISTS tracking_events (
    id SERIAL PRIMARY KEY,
    tracking_number VARCHAR(255) NOT NULL,
    carrier_code VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL,
    status_description TEXT,
    event_timestamp TIMESTAMP NOT NULL,
    location VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    external_event_id VARCHAR(255),
    is_latest BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    carrier_key_id INTEGER REFERENCES carrier_keys(id)
);

-- Insert sample carrier configurations
INSERT INTO carrier_keys (carrier_code, carrier_type, carrier_name, api_key, api_secret, base_url, tracking_number_pattern, is_active)
VALUES 
  ('UPS', 'UPS', 'United Parcel Service', 'demo_ups_key', 'demo:password', 'https://onlinetools.ups.com/api', '^1Z[0-9A-Z]{16}$', true),
  ('FEDEX', 'FEDEX', 'FedEx Corporation', 'demo_fedex_client_id', 'demo_fedex_client_secret', 'https://apis.fedex.com', '^[0-9]{12}$|^[0-9]{14}$', true),
  ('MAERSK', 'MAERSK', 'A.P. Moller-Maersk', 'demo_maersk_key', 'demo_maersk_token', 'https://api.maersk.com', '^[A-Z]{4}[0-9]{7}$', true)
ON CONFLICT (carrier_code) DO NOTHING;
