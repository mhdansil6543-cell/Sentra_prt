import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import { Box, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import AuditActionChip from "../../components/audit/AuditActionChip";
import AuditStatusChip from "../../components/audit/AuditStatusChip";

function SkeletonRows() {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #E5E7EB",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 0.9fr 1.1fr 0.8fr 0.7fr", gap: 2, p: 2, borderBottom: "1px solid #E5E7EB" }}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} height={22} />
        ))}
      </Box>
      {Array.from({ length: 8 }, (_, rowIndex) => (
        <Box
          key={rowIndex}
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr 0.9fr 1.1fr 0.8fr 0.7fr",
            gap: 2,
            p: 2,
            borderBottom: rowIndex === 7 ? 0 : "1px solid #E5E7EB",
          }}
        >
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} height={24} />
          ))}
        </Box>
      ))}
    </Paper>
  );
}

function EmptyState() {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", minHeight: 260, color: "#64748B" }}>
      <ManageSearchIcon sx={{ color: "#CBD5E1", fontSize: 48, mb: 1.5 }} />
      <Typography sx={{ color: "#111827", fontSize: 18, fontWeight: 800 }}>
        No audit records found
      </Typography>
      <Typography sx={{ color: "#6B7280", fontSize: 14, mt: 0.75 }}>
        No activity has been recorded.
      </Typography>
    </Stack>
  );
}

function AuditTable({
  rows,
  rowCount,
  loading,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
}) {
  const columns = [
    {
      field: "timestamp",
      headerName: "Timestamp",
      minWidth: 180,
      flex: 0.9,
      sortable: true,
    },
    {
      field: "user",
      headerName: "User",
      minWidth: 210,
      flex: 1,
      sortable: true,
    },
    {
      field: "action",
      headerName: "Action",
      minWidth: 150,
      flex: 0.8,
      sortable: false,
      renderCell: (params) => <AuditActionChip action={params.value} />,
    },
    {
      field: "target",
      headerName: "Target",
      minWidth: 220,
      flex: 1,
      sortable: false,
    },
    {
      field: "ip",
      headerName: "IP Address",
      minWidth: 150,
      flex: 0.75,
      sortable: false,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      flex: 0.6,
      sortable: false,
      renderCell: (params) => <AuditStatusChip status={params.value} />,
    },
  ];

  if (loading && rows.length === 0) {
    return <SkeletonRows />;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        rowCount={rowCount}
        loading={loading}
        paginationMode="server"
        sortingMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        pageSizeOptions={[10, 20, 50]}
        disableRowSelectionOnClick
        slots={{ noRowsOverlay: EmptyState }}
      sx={{
  border: 0,
  minHeight: 620,
  backgroundColor: "#FFFFFF",

  "& .MuiDataGrid-main": {
    backgroundColor: "#FFFFFF",
  },

  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #E5E7EB",
  },

  "& .MuiDataGrid-columnHeaderTitle": {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },

  "& .MuiDataGrid-row": {
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #E5E7EB",

    "&:hover": {
      backgroundColor: "#F8FAFC",
    },
  },

  "& .MuiDataGrid-cell": {
    color: "#111827",
    borderBottom: "none",
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    py: 1,
  },

  "& .MuiDataGrid-footerContainer": {
    backgroundColor: "#FFFFFF",
    borderTop: "1px solid #E5E7EB",
  },

  "& .MuiDataGrid-virtualScroller": {
    backgroundColor: "#FFFFFF",
  },

  "& .MuiDataGrid-overlay": {
    backgroundColor: "#FFFFFF",
  },
}} 
      />
    </Paper>
  );
}

export default AuditTable;
