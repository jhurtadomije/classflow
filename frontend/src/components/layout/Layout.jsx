// components/layout/Layout.jsx
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children, setToken }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="d-flex">
      <Sidebar open={open} setOpen={setOpen} isMobile={isMobile} />

      <div
        style={{
          flex: 1,
          marginLeft: isMobile ? "0" : "220px",
          minHeight: "100vh",
          background: "#f5f7fb",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Navbar setOpen={setOpen} setToken={setToken} isMobile={isMobile} />
        <div className="p-3">{children}</div>
      </div>

      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 998,
          }}
        />
      )}
    </div>
  );
}