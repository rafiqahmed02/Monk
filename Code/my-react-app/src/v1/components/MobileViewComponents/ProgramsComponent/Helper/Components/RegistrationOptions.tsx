import React, { useRef, useState } from "react";
import {
  Box,
  CircularProgress,
  Modal,
  Typography,
  IconButton,
} from "@mui/material";
import greencircle from "../../../../../photos/Newuiphotos/Icons/prayerIcons/Group 37671.webp";
import greyCircle from "../../../../../photos/Newuiphotos/Icons/prayerIcons/Group 37672.webp";
import greydollar from "../../../../../photos/Newuiphotos/Icons/prayerIcons/Vector-1.webp";
import greendollar from "../../../../../photos/Newuiphotos/Icons/prayerIcons/greenDollar.webp";
import toast from "react-hot-toast";
import { customNavigatorTo } from "../../../../../helpers/HelperFunction";
import { useNavigationprop } from "../../../../../../MyProvider";
import CloseIcon from "@mui/icons-material/Close";
import { AdminInterFace } from "../../../../../redux/Types";
import { useAppSelector } from "../../../../../redux/hooks";
import StripeErrorModal from "../../../Payments/StripeErrorModal/StripeErrorModal";
import { useDisableScrollOnNumberInput } from "../../../SharedHelpers/helpers";

interface RegistrationOptionsProps {
  isMainAdmin: boolean;
  stripeFields: [boolean, boolean];
  formData: any;
  handleChange: any;
  setFormData: any;
  error: boolean;
  isEditMode: boolean;
  isMasjidVerified?: boolean;
}
const RegistrationOptions = ({
  isMainAdmin = false,
  formData,
  stripeFields,
  handleChange,
  setFormData,
  error,
  isEditMode,
  isMasjidVerified,
}: RegistrationOptionsProps) => {
  const navigation = useNavigationprop();
  const [isPaymentsSetup, isStripeLoading] = stripeFields;
  const [openFeeModal, setOpenFeeModal] = useState<boolean>(false);
  const [isNoAccountDialogOpen, setIsNoAccountDialogOpen] =
    useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useDisableScrollOnNumberInput(inputRef);

  const isEditing = formData?.id ? true : false;

  const CallChange = (name: any, value: any) => {
    handleChange({
      target: {
        name: name,
        value: value,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };
  const handleToggle = (option: string) => {
    if (isEditing) return;
    if (formData?.registrationOption === option) return;
    if (!isMasjidVerified && option === "paid") {
      swal("This feature is unavailable as the masjid is not verified.");
      return;
    }

    if (!isPaymentsSetup && option === "paid") {
      setIsNoAccountDialogOpen(true);
      return;
    }
    // CallChange("registrationOption", option);
    if (option === "paid") {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        registrationOption: option,
        cost: "",
        isPaid: true,
        registrationRequired: true,
      }));
    } else {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        registrationOption: option,
        isPaid: false,
        cost: null,
      }));
    }
  };

  let admin = useAppSelector((state) => state.admin) as AdminInterFace;
  const modalStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 180,
    borderRadius: "18px",
    height: 100,
    bgcolor: "background.paper",
    boxShadow: 24,
    border: "none",
    p: 4,
  };
  const closeBtnStyle = {
    position: "absolute" as "absolute",
    top: "10px",
    right: "10px",
  };
  return (
    <div>
      <Box display="flex" alignItems="center" gap={2} mt={1} width={"100%"}>
        {/* Free box container */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          padding={1}
          borderRadius={6}
          border={1}
          borderColor={
            formData?.registrationOption === "free" ? "#1D785A" : "grey.400"
          }
          // onClick={() => handleToggle("free")}
          onClick={() => {
            if (!isEditMode) {
              handleToggle("free");
            } else {
              toast.dismiss();
              toast.error(
                "You cannot change the registration options for existing program. Kindly cancel this program and create a new one if needed."
              );
            }
          }} // sx={{ cursor: "pointer", userSelect: "none", width: "50%" }}
          sx={{
            cursor: isEditMode ? "not-allowed" : "pointer",
            userSelect: "none",
            width: "50%",
            background: isEditMode ? "#f5f5f5" : "inherit",
            opacity: isEditMode ? 0.5 : 1,
          }}
        >
          <Box display="flex" alignItems="center">
            <img
              src={
                formData?.registrationOption === "free"
                  ? greendollar
                  : greydollar
              }
              alt="Circle"
              style={{ height: 16, width: 10, marginRight: "5px" }}
              // style={{ height: 16, width: 16 }}
            />
            <Typography
              color={formData?.registrationOption === "free" ? "#1D785A" : ""}
              marginLeft={1}
              marginRight={1}
            >
              Free
            </Typography>
          </Box>

          {formData?.registrationOption === "free" ? (
            <img
              src={greencircle}
              alt="Circle"
              style={{ height: 16, width: 16 }}
            />
          ) : (
            <img
              src={greyCircle}
              alt="Circle"
              style={{ height: 16, width: 16 }}
            />
          )}
        </Box>
        {/* paid box container */}
        {(admin.role === "subadmin" || admin.role === "superadmin") && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            padding={1}
            borderRadius={6}
            border={1}
            borderColor={
              formData?.registrationOption === "paid" ? "#1D785A" : "grey.400"
            }
            // onClick={() => handleToggle("paid")}
            onClick={() => {
              if (!isEditMode) {
                handleToggle("paid");
              } else {
                toast.dismiss();
                toast.error(
                  "You cannot change the registration options for existing program. Kindly cancel this program and create a new one if needed."
                );
              }
            }}
            // sx={{
            //   cursor: "pointer",
            //   background: isPaymentsSetup ? null : "#dcd8d8",
            //   opacity: isPaymentsSetup ? "1" : "0.7",
            //   userSelect: "none",
            //   position: "relative",
            //   width: "50%",
            // }}
            sx={{
              cursor: isEditMode ? "not-allowed" : "pointer",
              background: isEditMode
                ? "#f5f5f5"
                : isPaymentsSetup
                ? null
                : "#dcd8d8",
              opacity: isEditMode || !isPaymentsSetup ? 0.5 : 1,
              userSelect: "none",
              position: "relative",
              width: "50%",
            }}
          >
            {isStripeLoading ? (
              <CircularProgress size="20px" />
            ) : formData?.registrationOption === "paid" ? (
              <>
                <Box display="flex" alignItems="center">
                  <img
                    src={greendollar}
                    alt="Dollar"
                    style={{ height: 16, width: 10, marginRight: "5px" }}
                  />
                  <Typography
                    color={
                      formData?.registrationOption === "paid" ? "#1D785A" : ""
                    }
                    marginLeft={1}
                    marginRight={1}
                  >
                    Paid
                  </Typography>
                </Box>

                <img
                  src={greencircle}
                  alt="Dollar"
                  style={{ height: 16, width: 16 }}
                />
              </>
            ) : (
              <>
                <Box display="flex" alignItems="center">
                  <img
                    src={greydollar}
                    alt="Dollar"
                    style={{ height: 16, width: 10, marginRight: "5px" }}
                  />
                  <Typography marginLeft={1} marginRight={1}>
                    Paid
                  </Typography>
                </Box>

                <img
                  src={greyCircle}
                  alt="Dollar"
                  style={{ height: 16, width: 16 }}
                />
              </>
            )}
          </Box>
        )}
      </Box>
      {isPaymentsSetup && formData?.registrationOption === "paid" ? (
        <Box
          display=""
          alignItems="center"
          gap={2}
          mt={1}
          mb={1.5}
          width={"100%"}
        >
          <label className="paid-price-label" htmlFor="cost-input">
            Price <span style={{ color: "red" }}>*</span>
          </label>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            padding={1}
            borderRadius={6}
            border={1}
            borderColor={
              error
                ? "red"
                : formData?.registrationOption === "paid"
                ? "#1D785A"
                : "grey.400"
            }
            onClick={() => handleToggle("paid")}
            sx={{
              cursor: isEditMode ? "not-allowed" : "pointer",
              background: isPaymentsSetup ? null : "#dcd8d8",
              opacity: isEditMode || !isPaymentsSetup ? 0.5 : 1,
              userSelect: "none",
              position: "relative",
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              sx={{
                border: "none",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <img
                src={greendollar}
                alt="Dollar"
                style={{ height: 16, width: 10, marginRight: "5px" }}
              />
              <input
                id="cost-input"
                type="number"
                value={formData.cost || ""}
                disabled={isEditMode}
                // onChange={isEditing ? null : handleChange}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                ref={inputRef}
                onChange={(e) => {
                  if (!isEditing) {
                    const value = e.target.value;
                    console.log("cost", value);
                    // Check if the value starts with a zero and has more than one digit
                    if (value.length > 1 && value.startsWith("0")) {
                      // Remove the leading zero
                      handleChange({
                        target: { name: "cost", value: value.slice(1) },
                      } as React.ChangeEvent<HTMLInputElement>);
                    } else if (value === "") {
                      handleChange(e); // Allow clearing the field
                    } else if (Number(value) < 0) {
                      // Prevent negative values
                      e.preventDefault();
                    } else {
                      handleChange(e);
                    }
                  }
                }}
                name="cost"
                style={{
                  cursor: isEditMode ? "not-allowed" : "pointer",
                  border: "none",
                  outline: "none",
                  padding: "3px",
                  width: "100%",
                  fontSize: "15px",
                  boxSizing: "border-box",
                  margin: "0px",
                  // background: isEditMode ? "#f5f5f5" : "white",
                  color: isEditMode ? "#888" : "black",
                }}
                // style={{
                //   border: "none",
                //   outline: "none",
                //   padding: "3px",
                //   width: "100%",
                //   fontSize: "15px",
                //   boxSizing: "border-box",
                //   margin: "0px",
                // }}
                placeholder="Amount"
              />
            </Box>
          </Box>
          <h3
            data-testid="fee-breakdown"
            className="fee-breakdown"
            onClick={() => setOpenFeeModal(!openFeeModal)}
          >
            Fee Breakdown
          </h3>
        </Box>
      ) : null}
      <Modal
        open={openFeeModal}
        onClose={() => setOpenFeeModal(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <IconButton onClick={() => setOpenFeeModal(false)} sx={closeBtnStyle}>
            <CloseIcon />
          </IconButton>
          <Typography
            className="fee-modal-title"
            data-testid="modal-fee-breakdown"
            variant="h6"
            component="h2"
          >
            Fee Breakdown
          </Typography>
          <div className="fee-info">
            <p>Stripe Charges</p>
            <p>2.9%+30c</p>
          </div>
          <div className="fee-info">
            <p>Platform Fees</p>
            <p>Free</p>
          </div>
        </Box>
      </Modal>

      <StripeErrorModal
        isMainAdmin={isMainAdmin}
        isOpen={isNoAccountDialogOpen}
        handleButtonClick={() => {
          toast.dismiss();
          if (navigation) navigation("/feed/12");
          else customNavigatorTo("/feed/12");
        }}
        handleClose={() => {
          toast.dismiss();
          setIsNoAccountDialogOpen(false);
          // if (navigation) navigation("/feed/0");
          // else customNavigatorTo("/feed/0");
        }}
        feature={"to make paid services"}
      />
    </div>
  );
};

export default RegistrationOptions;
