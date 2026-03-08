/*
  # XML to Shotgun Application Schema

  1. New Tables
    - `sequences`
      - `id` (uuid, primary key)
      - `name` (text) - sequence name from XML
      - `framerate` (integer) - frames per second
      - `cut_duration` (integer) - total duration in frames
      - `tc_in` (text) - timecode in
      - `tc_out` (text) - timecode out
      - `cut_in` (integer) - cut in frame
      - `cut_out` (integer) - cut out frame
      - `xml_file_name` (text) - original XML filename
      - `created_at` (timestamptz)
      - `user_id` (uuid) - references auth.users

    - `shots`
      - `id` (uuid, primary key)
      - `sequence_id` (uuid) - references sequences
      - `shot_code` (text) - shot code identifier
      - `cut_order` (text) - cut order position
      - `source_tc_in` (text) - source timecode in
      - `source_tc_out` (text) - source timecode out
      - `record_tc_in` (text) - record timecode in
      - `record_tc_out` (text) - record timecode out
      - `cut_in` (integer) - cut in frame number
      - `cut_out` (integer) - cut out frame number
      - `cut_duration` (integer) - duration in frames
      - `pathurl` (text) - source file path
      - `clip_name` (text) - clip name from XML
      - `shotgun_shot_id` (integer) - Shotgun shot ID
      - `shotgun_version_id` (integer) - Shotgun version ID
      - `created_at` (timestamptz)
      - `user_id` (uuid) - references auth.users

    - `shotgun_projects`
      - `id` (uuid, primary key)
      - `shotgun_id` (integer) - Shotgun project ID
      - `name` (text) - project name
      - `user_id` (uuid) - references auth.users
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  framerate integer NOT NULL,
  cut_duration integer NOT NULL,
  tc_in text NOT NULL,
  tc_out text NOT NULL,
  cut_in integer NOT NULL,
  cut_out integer NOT NULL,
  xml_file_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sequences"
  ON sequences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sequences"
  ON sequences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sequences"
  ON sequences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sequences"
  ON sequences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS shots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid REFERENCES sequences(id) ON DELETE CASCADE,
  shot_code text NOT NULL,
  cut_order text NOT NULL,
  source_tc_in text NOT NULL,
  source_tc_out text NOT NULL,
  record_tc_in text NOT NULL,
  record_tc_out text NOT NULL,
  cut_in integer NOT NULL,
  cut_out integer NOT NULL,
  cut_duration integer NOT NULL,
  pathurl text NOT NULL,
  clip_name text NOT NULL,
  shotgun_shot_id integer,
  shotgun_version_id integer,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE shots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shots"
  ON shots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shots"
  ON shots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shots"
  ON shots FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shots"
  ON shots FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS shotgun_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shotgun_id integer NOT NULL,
  name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shotgun_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shotgun projects"
  ON shotgun_projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shotgun projects"
  ON shotgun_projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shotgun projects"
  ON shotgun_projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shotgun projects"
  ON shotgun_projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_shots_sequence_id ON shots(sequence_id);
CREATE INDEX IF NOT EXISTS idx_shots_user_id ON shots(user_id);
CREATE INDEX IF NOT EXISTS idx_sequences_user_id ON sequences(user_id);
CREATE INDEX IF NOT EXISTS idx_shotgun_projects_user_id ON shotgun_projects(user_id);
