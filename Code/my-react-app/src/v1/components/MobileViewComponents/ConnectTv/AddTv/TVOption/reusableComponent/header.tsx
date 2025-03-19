import { Box, Typography, IconButton } from "@mui/material";
import styles from "../Option.module.css";
import ArrowBack from "../../../TV-Photos/backarrow.svg";

interface HeaderProps {
  name: string;
  children: any;
}

export function Header({ name, children }: HeaderProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", position: "relative" }}>
      <Box
        sx={{ flexGrow: 1, textAlign: "center" }}
        className={styles.deviceName}
      >
        <b>{name}</b>
        {children}
      </Box>
    </Box>
  );
}
