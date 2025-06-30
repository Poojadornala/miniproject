import { auth, db, doc, setDoc, getDoc, updateDoc } from './firebase.js';

async function addToCart(productId, productDetails) {
  const user = auth.currentUser;
  if (!user) return alert("Please login to add to cart");

  const cartRef = doc(db, "carts", user.uid);
  const cartSnap = await getDoc(cartRef);
  let cartItems = cartSnap.exists() ? cartSnap.data().items : [];

  // Check if already in cart
  const existing = cartItems.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cartItems.push({ id: productId, ...productDetails, qty: 1 });
  }

  await setDoc(cartRef, { items: cartItems });
  alert("Added to cart 🛒");
}
