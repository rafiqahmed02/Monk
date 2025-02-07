const express = require("express");
const { v4: uuidv4} = require("uuid");

const app = express();
app.use(express.json());

let couponsDB = {};

app.post("/coupons", (req,res) => {
    const coupon = {id: uuidv4(), ...req.body };
    couponsDB[coupon.id] = coupon;
    res.json(coupon);
})

app.get("/coupons", (req, res) => {
    res.json(Object.values(couponsDB));
})

app.get("/coupons/:couponId", (req, res) => {
    const coupon = couponsDB[req.params.couponId];
    if(!coupon) {
        return res.status(404).json({ message: "Coupon not found"});
    }
    res.json(coupon);
})

app.delete("/coupons/:couponId",(red,res) => {
    if(!couponsDB[red.params.couponId]) {
        return res.status(404).json({ message: "Coupon not found" })
    }
    delete couponsDB[req.params.couponId];
    res.json({ messgae: "Coupon deleted"});
})

app.post("/applicable-coupons", (req,res) => {
    const {cart} = req.body;
    let applicableCoupons = [];
    let totalCartValue = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    Object.values(couponsDB).forEach((coupon) => {
        if (coupon.type === "cart-wise" && totalCartValue > coupon.details.threshold) {
            const discount = (totalCartValue * coupon.details.discount) / 100;
            applicableCoupons.push({couponId: coupon.id, type: "cart-wise", discount});
        } else if (coupon.type === "product-wise") {
            cart.items.forEach((item) => {
                if (item.product_id === coupon.details.product_id){
                    const discount = (item.price * item.quantity * coupon.details.discount)/ 100;
                    applicableCoupons.push({ couponId: coupon.id, type:"product-wise", discount });
                }
            })
        } else if (coupon.type === "bxgy") {
            let buyCounts = {};
            cart.items.forEach(item => buyCounts[item.product_id] = item.quantity);
            let buyEligible = coupon.details.buy_products.reduce((acc, bp) => acc + Math.floor((buyCounts[bp.product_id] || 0 ) / bp.quantity),0);
            let applicableTimes = Math.min(buyEligible, coupon.details.repetition_limit);
            if (applicableTimes > 0) {
                let discount = coupon.details.get_products.reduce((acc, gp) => {
                    let product = cart.items.find(item => item.product_id === gp.product_id);
                    return acc + (gp.quantity * applicableTimes * (product ? product.price : 0));
                }, 0);
                applicableCoupons.push({couponId: coupon.id, type: "bxgy", discount});
            }
        }
    });
    res.json({ applicableCoupons});
});
const PORT = 8000;
app.listen(PORT,() => {
    console.log(`Server running pn port ${PORT}`);
});
