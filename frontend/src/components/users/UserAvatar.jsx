import { Avatar } from "@mui/material";

function UserAvatar({ user }) {
  // If avatar exists, use it
  if (user.avatar) {
    return (
      <Avatar
        src={user.avatar}
        alt={user.full_name}
        sx={{ width: 40, height: 40 }}
      />
    );
  }

  // Otherwise, show first two initials
  const initials = user.full_name
    ?.split(" ")
    .slice(0, 2)
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <Avatar
      sx={{
        width: 40,
        height: 40,
        backgroundColor: "#6366f1",
        fontWeight: 600,
      }}
    >
      {initials || "U"}
    </Avatar>
  );
}

export default UserAvatar;