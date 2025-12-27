CREATE TABLE notification_types (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL
);


INSERT INTO notification_types (type, title, description) VALUES
('profile_visit', 'Profile Visited', '{actor_name} visited your profile.'),
('new_message', 'New Message', 'You have received a new message from {actor_name}.'),
('like', 'New Like', '{actor_name} liked your profile.'),
('unlike', 'Like Removed', '{actor_name} removed their like from your profile.');


CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER NOT NULL,
    notifier_id INTEGER NOT NULL,
    notification_type_id INTEGER NOT NULL,
    status BOOLEAN DEFAULT FALSE, -- Read/unread status of the notification
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES "user" (id) ON DELETE CASCADE,
    FOREIGN KEY (notifier_id) REFERENCES "user" (id) ON DELETE CASCADE,
    FOREIGN KEY (notification_type_id) REFERENCES notification_types (id) ON DELETE SET NULL
);

CREATE TABLE fake_account_report (
    id SERIAL PRIMARY KEY,
    reporting_user_id INTEGER NOT NULL,
    reported_user_id INTEGER NOT NULL,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporting_user_id) REFERENCES "user" (id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES "user" (id) ON DELETE CASCADE,
    UNIQUE (reporting_user_id, reported_user_id)
);
