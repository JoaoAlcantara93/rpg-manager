-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  character_class TEXT,
  level INTEGER DEFAULT 1,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  hp_current INTEGER DEFAULT 0,
  hp_max INTEGER DEFAULT 0,
  ac INTEGER DEFAULT 10,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Create policies for players
CREATE POLICY "Users can view their own players" 
ON public.players 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own players" 
ON public.players 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own players" 
ON public.players 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own players" 
ON public.players 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_players_updated_at
BEFORE UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();