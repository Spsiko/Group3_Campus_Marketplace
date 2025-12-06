import "../style/studentfooter.scss";

export default function StudentFooter() {
  return (
    <footer className="student-footer" role="contentinfo">
      <div className="sf-inner">
        <div className="sf-line">
          <strong>Campus Marketplace</strong>
          <span className="sep">|</span>
          <span>Purdue University Fort Wayne</span>
        </div>
        <div className="sf-line small">© {new Date().getFullYear()} — All Rights Reserved</div>
      </div>
    </footer>
  );
}
