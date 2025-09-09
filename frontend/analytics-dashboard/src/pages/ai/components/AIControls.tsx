import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import { Psychology as AIIcon } from '@mui/icons-material';

interface AIControlsProps {
  selectedFarm: string;
  setSelectedFarm: (farm: string) => void;
  selectedAnimal: string;
  setSelectedAnimal: (animal: string) => void;
  predictionHorizon: number;
  setPredictionHorizon: (horizon: number) => void;
  aiEnabled: boolean;
  setAiEnabled: (enabled: boolean) => void;
  confidence: number;
  setConfidence: (confidence: number) => void;
  farms: any[];
  animals: any[];
}

export const AIControls: React.FC<AIControlsProps> = ({
  selectedFarm,
  setSelectedFarm,
  selectedAnimal,
  setSelectedAnimal,
  predictionHorizon,
  setPredictionHorizon,
  aiEnabled,
  setAiEnabled,
  confidence,
  setConfidence,
  farms,
  animals,
}) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>ฟาร์ม</InputLabel>
              <Select
                value={selectedFarm}
                onChange={(e) => setSelectedFarm(e.target.value)}
                label="ฟาร์ม"
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                {farms.map((farm) => (
                  <MenuItem key={farm.id} value={farm.id}>
                    {farm.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>สัตว์</InputLabel>
              <Select
                value={selectedAnimal}
                onChange={(e) => setSelectedAnimal(e.target.value)}
                label="สัตว์"
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                {animals.map((animal) => (
                  <MenuItem key={animal.id} value={animal.id}>
                    {animal.tagNumber} - {animal.breed}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ช่วงเวลาทำนาย: {predictionHorizon} วัน
              </Typography>
              <Slider
                value={predictionHorizon}
                onChange={(e, value) => setPredictionHorizon(value as number)}
                min={7}
                max={90}
                step={7}
                marks={[
                  { value: 7, label: '7d' },
                  { value: 30, label: '30d' },
                  { value: 60, label: '60d' },
                  { value: 90, label: '90d' },
                ]}
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ระดับความเชื่อมั่น: {confidence}%
              </Typography>
              <Slider
                value={confidence}
                onChange={(e, value) => setConfidence(value as number)}
                min={50}
                max={99}
                step={1}
                marks={[
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 85, label: '85%' },
                  { value: 95, label: '95%' },
                ]}
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="เปิดใช้งาน AI"
          />
          <Chip
            icon={<AIIcon />}
            label={`ความเชื่อมั่น: ${confidence}%`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

