-- TYPES
CREATE TYPE MESSAGE_STATUS AS ENUM ('unread', 'read');
CREATE TYPE EVENT_STATUS AS ENUM("proposed", "accepted", "declined", "cancelled")

-- SCHEMA
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    discord_id VARCHAR(255) UNIQUE,
    email VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- hashed --
    password_salt VARCHAR(64) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE, -- for email verification --
    is_profile_complete BOOLEAN DEFAULT FALSE, -- for profile completion ---
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    biography TEXT,
    age INTEGER,
    gender VARCHAR(20),
    sexual_preference VARCHAR(20),
    fame_rating INTEGER DEFAULT 1,
    likes_count INTEGER DEFAULT 0,
    fake_account_reports_count INTEGER DEFAULT 0,
    profile_picture VARCHAR(255),
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    location_updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "email_verification" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "password_reset" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_photo (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    photo VARCHAR(255) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE SET NULL
);

CREATE TABLE user_interest (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    interest VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE,
    UNIQUE (user_id, interest)
);

CREATE TABLE history (
    id SERIAL PRIMARY KEY,
    visitor_id INTEGER NOT NULL,
    visited_id INTEGER NOT NULL,
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visitor_id) REFERENCES "user" (id) ON DELETE CASCADE,
    FOREIGN KEY (visited_id) REFERENCES "user" (id) ON DELETE CASCADE
);

CREATE TABLE event {
    id SERIAL PRIMARY KEY,
    creator_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    notes TEXT NULL,
    event_status EVENT_STATUS DEFAULT 'proposed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (creator_id) REFERENCES "user" (id) ON DELETE SET NULL
};

CREATE TABLE dm (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content_type VARCHAR(255) NOT NULL CHECK(content_type IN ('text', 'audio', 'event')), 

    content TEXT NULL,
    event_id INTEGER NULL,

    status MESSAGE_STATUS DEFAULT 'unread',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sender_id) REFERENCES "user" (id) ON DELETE SET NULL,
    FOREIGN KEY (receiver_id) REFERENCES "user" (id) ON DELETE SET NULL
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,

    CONSTRAINT dm_content_or_event_check CHECK (
        (content_type IN ('text', 'audio') AND content IS NOT NULL and event_id IS NULL)
        OR
        (content_type = 'event' AND event_id IS NOT NULL AND content IS NULL)
    )
);

CREATE TABLE user_likes (
    id SERIAL PRIMARY KEY,
    liking_user_id INTEGER NOT NULL,
    liked_user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    are_matched BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (liking_user_id) REFERENCES "user" (id) ON DELETE CASCADE,
    FOREIGN KEY (liked_user_id) REFERENCES "user" (id) ON DELETE CASCADE,
    UNIQUE (liking_user_id, liked_user_id)
);

CREATE TABLE blocked_users (
    id SERIAL PRIMARY KEY,
    blocking_user_id INTEGER NOT NULL,
    blocked_user_id INTEGER NOT NULL,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blocking_user_id) REFERENCES "user" (id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_user_id) REFERENCES "user" (id) ON DELETE CASCADE,
    UNIQUE (blocking_user_id, blocked_user_id)
);

-- favorites chat contacts
CREATE TABLE user_favorite_contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- The user who is adding the favorite
    favorite_user_id INTEGER NOT NULL, -- The user who is being marked as a favorite
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE,
    FOREIGN KEY (favorite_user_id) REFERENCES "user" (id) ON DELETE CASCADE,
    UNIQUE (user_id, favorite_user_id)
);