import { useState } from "react";
import { Outlet } from "react-router-dom";
import StudentHeader from "./StudentHeader";
import StudentSidebar from "./StudentSidebar";
import StudentFooter from "./StudentFooter";
import "../style/studentlayout.scss";

export default function StudentLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="student-shell">
      <StudentHeader open={open} setOpen={setOpen} />
      <StudentSidebar open={open} onClose={() => setOpen(false)} />
      <main className={`student-main ${open ? "shifted" : ""}`}>
        <Outlet />
      </main>
      <StudentFooter />
    </div>
  );
}
