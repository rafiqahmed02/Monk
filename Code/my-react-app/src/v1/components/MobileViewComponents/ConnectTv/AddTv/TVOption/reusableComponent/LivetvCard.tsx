import {
  Box,
  Button,
  Container,
  Typography,
  styled,
  Paper,
  IconButton,
} from "@mui/material";
import ArrowBack from "../../../TV-Photos/backarrow.svg";
import { getImagePath2 } from "../../../helperfunc";

const StyledContainer = styled(Container)({
  backgroundColor: "white",
  borderRadius: 20,
  padding: "24px",
  maxWidth: "400px !important",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
});

const Header = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

const Title = styled(Typography)({
  textAlign: "center",
  flex: 1,
  "& .connected": {
    color: "#1B7B67",
    fontWeight: 500,
  },
  "& .device": {
    color: "#333",
    fontWeight: 600,
  },
});

const ButtonContainer = styled(Box)({
  display: "flex",
  gap: "12px",
  marginTop: "auto",
});

const UnlinkButton = styled(Button)({
  flex: 1,
  backgroundColor: "white",
  border: "1px solid #FF6B6B",
  color: "#FF6B6B",
  textTransform: "none",
  borderRadius: "25px",
  padding: "10px",
  "&:hover": {
    backgroundColor: "#FFF0F0",
  },
});

const ChangeButton = styled(Button)({
  flex: 1,
  backgroundColor: "#1B7B67",
  color: "white",
  textTransform: "none",
  borderRadius: "25px",
  padding: "10px",
  "&:hover": {
    backgroundColor: "#156755",
  },
});

export default function LivetvCard({ connectedTvData, onChange, onBack }: any) {
  console.log(connectedTvData);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
      }}
    >
      <StyledContainer>
        <Header sx={{ position: "relative" }}>
          <IconButton
            sx={{ position: "absolute", padding: "0", left: -15 }}
            aria-label="go back"
            onClick={onBack}
          >
            <img
              src={ArrowBack}
              alt=""
              style={{
                width: "50px",
                height: "50px",
              }}
            />
          </IconButton>
          <Title variant="body1">
            <span className="connected">Connected With</span>
            <br />
            <span className="device">{connectedTvData.name}</span>
          </Title>
        </Header>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <img
            src={getImagePath2(
              connectedTvData.type,
              connectedTvData.theme,
              connectedTvData.orientation,
              connectedTvData.color
            )}
            alt="Prayer Timings Display"
            width={400}
            height={300}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </Paper>

        <ButtonContainer>
          {/* <UnlinkButton onClick={onUnlink}>🔗 Unlink</UnlinkButton> */}
          <ChangeButton onClick={onChange}>Change Theme</ChangeButton>
        </ButtonContainer>
      </StyledContainer>
    </Box>
  );
}
