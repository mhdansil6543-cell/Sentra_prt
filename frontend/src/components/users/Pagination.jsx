import { Box, Button, Typography, Stack } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

function Pagination({ current, total, pageSize, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (current - 1) * pageSize + 1;
  const endIndex = Math.min(current * pageSize, total);

  const handlePrev = () => {
    if (current > 1) {
      onPageChange(current - 1);
    }
  };

  const handleNext = () => {
    if (current < totalPages) {
      onPageChange(current + 1);
    }
  };

  return (
    <Box
      sx={{
        py: 3,
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
      }}
    >
      <Typography
        sx={{
          fontSize: 14,
          color: "#6b7280",
          fontWeight: 500,
        }}
      >
        Showing {startIndex}–{endIndex} of {total}
      </Typography>

      <Stack direction="row" spacing={0.5} alignItems="center">
        <Button
          size="small"
          variant="text"
          startIcon={<ChevronLeftIcon sx={{ fontSize: 20 }} />}
          onClick={handlePrev}
          disabled={current === 1}
          sx={{
            textTransform: "none",
            color: current === 1 ? "#d1d5db" : "#6b7280",
            fontWeight: 500,
            fontSize: 14,
            px: 1.5,
            "&:hover": {
              backgroundColor: current === 1 ? "transparent" : "#f3f4f6",
            },
          }}
        >
          Prev
        </Button>

        <Box
          sx={{
            minWidth: 50,
            textAlign: "center",
            px: 1.5,
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            {current} / {totalPages}
          </Typography>
        </Box>

        <Button
          size="small"
          variant="text"
          endIcon={<ChevronRightIcon sx={{ fontSize: 20 }} />}
          onClick={handleNext}
          disabled={current === totalPages}
          sx={{
            textTransform: "none",
            color: current === totalPages ? "#d1d5db" : "#6b7280",
            fontWeight: 500,
            fontSize: 14,
            px: 1.5,
            "&:hover": {
              backgroundColor: current === totalPages ? "transparent" : "#f3f4f6",
            },
          }}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
}

export default Pagination;
