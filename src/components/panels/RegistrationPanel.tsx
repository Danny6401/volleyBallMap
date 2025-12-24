import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import type { ChangeEvent } from "react";
import type { Court, SkillLevel } from "../../types";

type RegistrationPanelProps = {
  court: Court;
  selectedDate: string;
  selectedTimeSlotId: string;
  selectedLevel: SkillLevel;
  headcount: number;
  nicknames: string[];
  onDateChange: (value: string) => void;
  onTimeSlotChange: (timeSlotId: string) => void;
  onHeadcountChange: (count: number) => void;
  onNicknamesChange: (names: string[]) => void;
  onSubmit: () => void;
};

const RegistrationPanel = ({
  court,
  selectedDate,
  selectedTimeSlotId,
  selectedLevel,
  headcount,
  nicknames,
  onDateChange,
  onTimeSlotChange,
  onHeadcountChange,
  onNicknamesChange,
  onSubmit,
}: RegistrationPanelProps) => {
  const dateValue = selectedDate ? dayjs(selectedDate) : null;

  const handleHeadcountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Math.max(1, Math.min(12, Number(event.target.value) || 1));
    onHeadcountChange(next);
  };

  const handleNicknameChange = (value: string, idx: number) => {
    const next = [...nicknames];
    next[idx] = value;
    onNicknamesChange(next);
  };

  return (
    <Paper
      elevation={6}
      sx={{
        p: 2,
        borderRadius: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={2} sx={{ flex: 1, overflow: "auto" }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            報名資訊
          </Typography>
          <Typography variant="body2" color="text.secondary">
            程度會依選擇的時段自動帶出
          </Typography>
        </Box>

        <DatePicker
          label="日期"
          value={dateValue}
          format="YYYY/MM/DD"
          onChange={(value) =>
            onDateChange(value ? value.format("YYYY-MM-DD") : "")
          }
          slotProps={{
            textField: {
              fullWidth: true,
            },
          }}
        />

        <FormControl fullWidth>
          <InputLabel id="time-slot-label">時段</InputLabel>
          <Select
            labelId="time-slot-label"
            label="時段"
            value={selectedTimeSlotId}
            onChange={(e) => onTimeSlotChange(e.target.value)}
          >
            {court.timeSlots.map((slot) => (
              <MenuItem key={slot.id} value={slot.id}>
                {slot.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            程度
          </Typography>
          <Chip
            label={levelLabel(selectedLevel)}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Stack>

        <TextField
          label="人數"
          type="number"
          value={headcount}
          onChange={handleHeadcountChange}
          fullWidth
        />
        <TextField label="手機號碼" fullWidth />

        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            暱稱
          </Typography>
          <Stack spacing={1}>
            {nicknames.map((name, idx) => (
              <TextField
                key={`${idx}-${court.id}`}
                value={name}
                label={`隊員 ${idx + 1}`}
                placeholder="輸入暱稱"
                onChange={(e) => handleNicknameChange(e.target.value, idx)}
                fullWidth
              />
            ))}
          </Stack>
        </Box>

        <Button variant="contained" size="large" onClick={onSubmit}>
          送出報名
        </Button>
      </Stack>
    </Paper>
  );
};

const levelLabel = (level: SkillLevel) => {
  switch (level) {
    case "beginner":
      return "初階";
    case "intermediate":
      return "中階";
    case "advanced":
      return "進階";
    default:
      return "混合";
  }
};

export default RegistrationPanel;
