import {
  Box,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import type { Court } from '../../types';

type NearbyCourt = {
  court: Court;
  distanceKm: number;
};

type NearbyCourtsPanelProps = {
  items: NearbyCourt[];
  selectedCourtId: string;
  onlyVisible: boolean;
  totalCount: number;
  visibleCount: number;
  onToggleVisible: (value: boolean) => void;
  onSelectCourt: (courtId: string) => void;
};

const NearbyCourtsPanel = ({
  items,
  selectedCourtId,
  onlyVisible,
  totalCount,
  visibleCount,
  onToggleVisible,
  onSelectCourt,
}: NearbyCourtsPanelProps) => {
  const countText = onlyVisible ? visibleCount : totalCount;

  return (
    <Box
      sx={{
        bgcolor: 'rgba(10,12,24,0.88)',
        color: 'white',
        borderRadius: 2,
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          此範圍內 {countText} 個球場
        </Typography>
        <FormControlLabel
          label="只顯示可視範圍"
          control={
            <Switch
              checked={onlyVisible}
              onChange={(e) => onToggleVisible(e.target.checked)}
              color="primary"
            />
          }
          sx={{
            color: 'rgba(255,255,255,0.8)',
            m: 0,
          }}
        />
      </Stack>

      <Box sx={{ mt: 1, overflow: 'auto' }}>
        {items.map(({ court, distanceKm }) => (
          <Box
            key={court.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectCourt(court.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSelectCourt(court.id);
            }}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor:
                court.id === selectedCourtId
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(255,255,255,0.04)',
              mb: 1,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease, transform 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.14)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Typography fontWeight={700}>{court.name}</Typography>
              <Typography color="rgba(255,255,255,0.7)">
                {distanceKm.toFixed(1)} km
              </Typography>
            </Stack>
            <Typography variant="body2" color="rgba(255,255,255,0.65)">
              {court.address}
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap mt={1}>
              {court.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                />
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export type { NearbyCourt };
export default NearbyCourtsPanel;
