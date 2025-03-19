import { Button, FormControl, Select } from "@mui/material";
import { styled } from "@mui/system";
export const CustomSelect = styled(Select)`
  & .MuiOutlinedInput-root {
    border-radius: 20px;

    & .MuiOutlinedInput-notchedOutline {
      border-color: #2e2e2e;
      border-radius: 20px;
    }
  }

  & .MuiSelect-select {
    padding: 8px 14px;
    font-size: 14px;
  }
`;
export const CustomFormControl = styled(FormControl)`
  & .MuiOutlinedInput-root: {
  width: 100%,
    & .MuiOutlinedInput-notchedOutline: {
        borderColor: "#cfcfcf",
        borderRadius: "20px",
    },
},
`;
