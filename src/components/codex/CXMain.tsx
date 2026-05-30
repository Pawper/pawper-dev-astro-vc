import React, { useState } from "react";
import type { View, ModalState, Theme } from "../../types";
import { CX_INDEX, PROJECT_CATEGORIES, LOG_CATEGORIES, DEFAULT_PROJECT_CAT, SERVICES } from "../../data/content";
import { SharePopover } from "./CXModal";
import resumeAssets from "../../data/resume-assets.json";
import CXBtn, { RssIcon } from "./CXBtn";
import CXSectionFrame from "./CXSectionFrame";
import CXLanding from "./CXLanding";
import CXProjectsGrid from "./CXProjectsGrid";
import CXLogsGrid from "./CXLogsGrid";
import CXContactCombo, { CXContactFooter } from "./CXContactCombo";
import DCAgenda from "./detail/DCAgenda";
import CXSeriesPanel from "./CXSeriesPanel";
import DCBio, { DCBioFooter } from "./detail/DCBio";
import DCSkills from "./detail/DCSkills";
import DCActivity from "./detail/DCActivity";
import DCTraining from "./detail/DCTraining";
import DCResume from "./detail/DCResume";
import DCPersonnelOverview from "./detail/DCPersonnelOverview";
import DCProjectsOverview from "./detail/DCProjectsOverview";
import DCLogsOverview from "./detail/DCLogsOverview";
import DCServicesOverview from "./detail/DCServicesOverview";
import DCServiceEntry from "./detail/DCServiceEntry";

interface CXMainProps {
  view: View;
  selectEntry: (catId: string, entryId: string) => void;
  selectCategory: (catId: string) => void;
  setView: (view: View) => void;
  setHeaderExpanded: (v: boolean) => void;
  openModal: (m: ModalState) => void;
  agendaScrollTarget?: string;
  onAgendaScrolled?: () => void;
  navigateToAgenda?: (eventId: string) => void;
  theme: Theme;
}

export function StatusBar() {
  const date = new Date().toLocaleDateString("en-CA").replace(/-/g, ".");
  return (
    <div className="cx-status-bar" style={{
      position: "absolute", bottom: 26, left: 360, right: 24, zIndex: 10,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 12px 9px 52px",
    }}>
      <span className="pw-mono" style={{ fontSize: 10, color: "black", letterSpacing: "0.16em", textTransform: "uppercase" }}>
        Session opened · {date}
      </span>
      <span className="pw-mono cx-esc-hint" style={{ fontSize: 10, color: "black", letterSpacing: "0.16em", textTransform: "uppercase" }}>
        Esc to close panels
      </span>
    </div>
  );
}

export default function CXMain({ view, selectEntry, selectCategory, setView, setHeaderExpanded, openModal, agendaScrollTarget, onAgendaScrolled, navigateToAgenda, theme }: CXMainProps) {
  const cat = CX_INDEX.find((c) => c.id === view.cat);
  const [contactSent, setContactSent] = useState(false);
  const [contactHasMessage, setContactHasMessage] = useState(false);
  const overviewCat = view.cat !== "contact" ? view.cat : undefined;
  const goToOverview = overviewCat ? () => selectEntry(overviewCat, "overview") : undefined;

  // Section accent colors for SharePopover
  const isDark = theme === "dark";
  const primaryHex   = isDark ? (cat?.accent ?? "#ffffff")     : (cat?.accentLight     ?? cat?.accent     ?? "#000000");
  const secondaryHex = isDark ? (cat?.accentDeep ?? "#cccccc") : (cat?.accentDeepLight ?? cat?.accentDeep ?? "#444444");

  if (view.kind === "home") {
    return <CXLanding onCategory={selectCategory} onEntry={selectEntry} />;
  }

  if (view.kind === "entry" && view.cat === "personnel" && view.entry === "overview") {
    return (
      <CXSectionFrame cat={cat} crumb="Overview" onOverview={goToOverview}>
        <DCPersonnelOverview selectEntry={selectEntry} />
      </CXSectionFrame>
    );
  }

  if (view.kind === "entry" && view.cat === "projects" && view.entry === "overview") {
    return (
      <CXSectionFrame cat={cat} crumb="Overview" onOverview={goToOverview}>
        <DCProjectsOverview selectEntry={selectEntry} />
      </CXSectionFrame>
    );
  }

  if (view.kind === "entry" && view.cat === "logs" && view.entry === "overview") {
    return (
      <CXSectionFrame cat={cat} crumb="Overview" onOverview={goToOverview}>
        <DCLogsOverview selectEntry={selectEntry} />
      </CXSectionFrame>
    );
  }

  if (view.kind === "grid" && view.cat === "projects") {
    return (
      <CXSectionFrame cat={cat} crumb="all projects" onOverview={goToOverview}>
        <CXProjectsGrid onOpen={(id) => selectEntry("projects", id)} />
      </CXSectionFrame>
    );
  }

  if (view.kind === "entry" && view.cat === "projects" && view.entry) {
    const projCat = PROJECT_CATEGORIES.find((c) => c.id === view.entry);
    return (
      <CXSectionFrame cat={cat} crumb={projCat?.label ?? view.entry} onOverview={goToOverview} footer={
        <div className="cx-btn-row" style={{ display: "flex", gap: 8 }}>
          <CXBtn num="01" label="RSS feed" href={`/feed/projects/${view.entry}.xml`} primary icon={<RssIcon />} />
          <CXBtn num="02" label="GitHub" href="https://github.com/Pawper?tab=repositories&q=topic%3Aportfolio-project" />
        </div>
      }>
        <CXProjectsGrid category={view.entry} onOpen={(id) => selectEntry("projects", id)} />
      </CXSectionFrame>
    );
  }

  if (view.kind === "entry" && view.cat === "logs" && view.entry === "series") {
    return (
      <CXSectionFrame cat={cat} crumb="Series" onOverview={goToOverview}>
        <CXSeriesPanel openModal={openModal} />
      </CXSectionFrame>
    );
  }

  if (view.kind === "entry" && view.cat === "logs" && view.entry) {
    const logCat = LOG_CATEGORIES.find((c) => c.id === view.entry);
    const rssFeedUrl = view.entry === "latest" ? "/feed.xml" : `/feed/logs/${view.entry}.xml`;
    return (
      <CXSectionFrame cat={cat} crumb={logCat?.label ?? view.entry} onOverview={goToOverview} footer={
        <div className="cx-btn-row" style={{ display: "flex", gap: 8 }}>
          <CXBtn num="01" label="RSS feed" href={rssFeedUrl} primary icon={<RssIcon />} />
          <CXBtn num="02" label="dev.to" href="https://dev.to/pawper" />
        </div>
      }>
        <CXLogsGrid category={view.entry} onOpen={(id) => selectEntry("logs", id)} />
      </CXSectionFrame>
    );
  }

  if (view.kind === "entry") {
    const entry = cat?.entries.find((e) => e.id === view.entry);
    return (
      <CXSectionFrame cat={cat} crumb={entry?.label} onOverview={goToOverview}
        footer={
          view.cat === "personnel" && view.entry === "bio"
            ? <DCBioFooter selectEntry={selectEntry} />
            : view.cat === "personnel" && view.entry === "skills"
            ? (
              <div className="cx-btn-row" style={{ display: "flex", gap: 8 }}>
                <CXBtn num="01" label="View GitHub" href="https://github.com/Pawper" primary />
                <CXBtn num="02" label="LinkedIn Skills" href="https://www.linkedin.com/in/pawper/details/skills/" />
              </div>
            )
            : view.cat === "personnel" && view.entry === "resume"
            ? (
              <div className="cx-btn-row" style={{ display: "flex", gap: 8 }}>
                <CXBtn num="01" label="Download PDF" href={resumeAssets.pdfUrl.replace("/raw/upload/", "/raw/upload/fl_attachment/")} primary icon={<span className="cx-btn-icon">↓</span>} />
                <CXBtn num="02" label="Open in Browser" href="/resume" />
                <SharePopover
                  shareUrl="https://pawper.dev/about/resume"
                  title="Resume · Phillip Wessels"
                  num="03" primaryHex={primaryHex} secondaryHex={secondaryHex} isDark={isDark} hasPrimary={true}
                />
              </div>
            )
            : view.cat === "personnel" && view.entry === "activity"
            ? <CXBtn num="01" label="RSS feed" href="/feed.xml" primary icon={<RssIcon />} />
            : view.cat === "services"
            ? (
              <div className="cx-btn-row" style={{ display: "flex", gap: 8 }}>
                <CXBtn num="01" label="Contact" onClick={() => {
                  const svc = SERVICES.find((s) => s.id === view.entry);
                  const url = new URL(window.location.href);
                  url.searchParams.set("subject", svc ? `${svc.label} inquiry` : "Services inquiry");
                  window.history.replaceState({}, "", url.toString());
                  selectEntry("contact", "all");
                }} primary icon={null} />
                <CXBtn num="02" label="Resume" onClick={() => selectEntry("personnel", "resume")} icon={null} />
                <SharePopover
                  shareUrl={`https://pawper.dev/services${view.entry && view.entry !== "overview" ? `/${view.entry}` : ""}`}
                  title={cat?.entries.find((e) => e.id === view.entry)?.label ?? "Services"}
                  num="03" primaryHex={primaryHex} secondaryHex={secondaryHex} isDark={isDark} hasPrimary={true}
                />
              </div>
            )
            : view.cat === "contact"
            ? (
              <div className="cx-btn-row" style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <CXContactFooter sent={contactSent} hasMessage={contactHasMessage} />
                <SharePopover
                  shareUrl="https://pawper.dev/contact"
                  title="Contact · pawper.dev"
                  num={contactHasMessage || contactSent ? "02" : "01"} primaryHex={primaryHex} secondaryHex={secondaryHex} isDark={isDark} hasPrimary={contactHasMessage || contactSent}
                />
              </div>
            )
            : view.cat === "calendar"
            ? (
              <div className="cx-btn-row" style={{ display: "flex", gap: 8 }}>
                <CXBtn num="01" label="Inquire" primary icon={null} onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("subject", "Speaking & events inquiry");
                  window.history.replaceState({}, "", url.toString());
                  selectEntry("contact", "all");
                }} />
                <SharePopover
                  shareUrl="https://pawper.dev/agenda"
                  title="Agenda · pawper.dev"
                  num="02" primaryHex={primaryHex} secondaryHex={secondaryHex} isDark={isDark} hasPrimary={true}
                />
              </div>
            )
            : undefined
        }
      >
        {view.cat === "personnel" && view.entry === "bio"      && <DCBio onService={(entryId) => selectEntry("services", entryId)} />}
        {view.cat === "personnel" && view.entry === "skills"   && <DCSkills openModal={openModal} />}
        {view.cat === "personnel" && view.entry === "activity" && <DCActivity openModal={openModal} />}
        {view.cat === "personnel" && view.entry === "training" && <DCTraining openModal={openModal} />}
        {view.cat === "personnel" && view.entry === "resume"   && <DCResume />}
        {view.cat === "services"  && view.entry === "overview"    && <DCServicesOverview selectEntry={selectEntry} />}
        {view.cat === "services"  && view.entry === "employment"  && <DCServiceEntry id="employment"  selectEntry={selectEntry} openModal={openModal} />}
        {view.cat === "services"  && view.entry === "contracting" && <DCServiceEntry id="contracting" selectEntry={selectEntry} openModal={openModal} />}
        {view.cat === "services"  && view.entry === "consulting"  && <DCServiceEntry id="consulting"  selectEntry={selectEntry} openModal={openModal} />}
        {view.cat === "services"  && view.entry === "coaching"    && <DCServiceEntry id="coaching"    selectEntry={selectEntry} openModal={openModal} />}
        {view.cat === "services"  && view.entry === "speaking"    && <DCServiceEntry id="speaking"    selectEntry={selectEntry} openModal={openModal} />}
        {view.cat === "services"  && view.entry === "mentoring"   && <DCServiceEntry id="mentoring"   selectEntry={selectEntry} openModal={openModal} />}
        {view.cat === "contact"                                && <CXContactCombo onSent={() => setContactSent(true)} onService={(entryId) => selectEntry("services", entryId)} onMessageChange={setContactHasMessage} />}
        {view.cat === "calendar"                               && <DCAgenda scrollToId={agendaScrollTarget} onScrolled={onAgendaScrolled} openModal={openModal} />}
      </CXSectionFrame>
    );
  }

  return null;
}
