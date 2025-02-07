import React, {useState, useEffect} from "react";
import axios from "axios";
import { Container, Button, Table, TableHead, TableRow, TableCell, TableBody, Textfield} from "@mui/material";

const App = () => {
  const [cart, setCart] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [applicableCoupons, setApplicableCoupons] = useState([]);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get("http://localhost:8000/coupons");
      setCoupons(response.data);
    } catch(error) {
      console.error("Error fetching coupons", error);
    }
  }
  const handleApplyCoupons = async() => {
    try {
      const response = await axios.post("http://localhost:8000/applicale-coupons", {cart: { items:cart }});
      setApplicableCoupons(response.data.applicableCoupons);
    } catch (error) {
      console.error("Error applying coupons", error);
    }
  };
  return (
    <Container>
      <h1>
        Coupon Management
      </h1>
      <Textfield 
      label = "Product ID"
      type="number"
      onChange={(e) => setCart([...cart,{ product_id: parseInt(e.target.value), quantity: 1, price:100}])}
      />
      <Button
      variant="contained" color="primary" onClick={handleApplyCoupons}>
Apply Coupons        
      </Button>
      <h2>Applicable Coupons</h2>
      <Table>
        <TableHead>
          <TableRow>
          <TableCell>Coupon ID</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Discount</TableCell>
            </TableRow>
            <TableBody>
              {applicableCoupons.map((coupon,index) => (
                <TableRow key={index}>
<TableCell>{coupon.coupon_id}</TableCell>
<TableCell>{coupon.type}</TableCell>
<TableCell>{coupon.discount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
        </TableHead>
      </Table>
    </Container>
  )

}
export default App;