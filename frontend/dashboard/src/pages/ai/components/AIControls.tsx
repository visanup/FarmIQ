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
  Avatar,
  alpha,
  Fade,
  Zoom,
} from '@mui/material';
import { 
  Psychology as AIIcon,
  Assessment as AssessmentIcon,
  Pets as PetsIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { safeRenderValue } from '../../../utils/displayUtils';

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
  farms = [],
  animals = [],
}) => {
  return (
    <Fade in timeout={1000}>
      <Card sx={{ 
        mb: 3, 
        borderRadius: 3,
        border: `1px solid ${alpha('#9C27B0', 0.2)}`,
        background: `linear-gradient(135deg, ${alpha('#9C27B0', 0.05)} 0%, ${alpha('#ffffff', 0.9)} 100%)`,
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, #9C27B0, #673AB7)`
        }} />
        
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <PsychologyIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              AI Controls & Settings
            </Typography>
          </Box>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontWeight: 500 }}>ฟาร์ม</InputLabel>
                <Select
                  value={selectedFarm}
                  onChange={(e) => setSelectedFarm(e.target.value)}
                  label="ฟาร์ม"
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha('#9C27B0', 0.3),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9C27B0',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9C27B0',
                      borderWidth: 2,
                    }
                  }}
                >
                  <MenuItem value="all">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssessmentIcon fontSize="small" color="action" />
                      ทั้งหมด ({farms.length})
                    </Box>
                  </MenuItem>
                  {farms.map((farm) => (
                    <MenuItem key={farm.id} value={farm.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssessmentIcon fontSize="small" color="primary" />
                        {safeRenderValue(farm.name)}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontWeight: 500 }}>สัตว์</InputLabel>
                <Select
                  value={selectedAnimal}
                  onChange={(e) => setSelectedAnimal(e.target.value)}
                  label="สัตว์"
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha('#4CAF50', 0.3),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4CAF50',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4CAF50',
                      borderWidth: 2,
                    }
                  }}
                >
                  <MenuItem value="all">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PetsIcon fontSize="small" color="action" />
                      ทั้งหมด ({animals.length})
                    </Box>
                  </MenuItem>
                  {animals.map((animal) => (
                    <MenuItem key={animal.id} value={animal.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PetsIcon fontSize="small" color="primary" />
                        {safeRenderValue(animal.tagNumber)} - {safeRenderValue(animal.breed)}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
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
                  sx={{ 
                    mt: 1,
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#9C27B0',
                      '&:hover': {
                        boxShadow: `0 0 0 8px ${alpha('#9C27B0', 0.16)}`,
                      }
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#9C27B0',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: alpha('#9C27B0', 0.2),
                    }
                  }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
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
                  sx={{ 
                    mt: 1,
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#673AB7',
                      '&:hover': {
                        boxShadow: `0 0 0 8px ${alpha('#673AB7', 0.16)}`,
                      }
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#673AB7',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: alpha('#673AB7', 0.2),
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ 
            mt: 3, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha('#9C27B0', 0.05)} 0%, ${alpha('#673AB7', 0.05)} 100%)`,
            border: `1px solid ${alpha('#9C27B0', 0.1)}`
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  color="primary"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#9C27B0',
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#9C27B0',
                      },
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PsychologyIcon fontSize="small" />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    เปิดใช้งาน AI
                  </Typography>
                </Box>
              }
            />
            <Chip
              icon={<AIIcon />}
              label={`ความเชื่อมั่น: ${confidence}%`}
              sx={{
                background: `linear-gradient(135deg, #9C27B0, #673AB7)`,
                color: 'white',
                fontWeight: 600,
                boxShadow: `0 4px 12px ${alpha('#9C27B0', 0.3)}`,
                '&:hover': {
                  transform: 'scale(1.05)',
                  transition: 'transform 0.2s ease'
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

