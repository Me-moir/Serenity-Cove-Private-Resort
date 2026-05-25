import { PersonFill } from "react-bootstrap-icons";

export default function ProfileSubtab1Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-light text-text-muted">
        Personal{" "}
        <span className="font-semibold text-text-on-light">Information</span>
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Profile card ───────────────────────────────────────── */}
        <div className="flex flex-col items-center rounded-3xl border border-border bg-card-light p-8 shadow-sm lg:col-span-1">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-shell text-text-muted">
            <PersonFill size={52} />
          </div>

          <h2 className="mt-6 text-center text-xl font-semibold text-text-on-light">
            Juan Dela Cruz
          </h2>
          <p className="mt-1 text-center text-sm text-text-muted">
            Booking Manager
          </p>

          <div className="mt-8 w-full space-y-5">
            <ProfileInfo label="Username" value="Admin" />
            <ProfileInfo label="Email" value="juandc.serenity@resort.com" />
            <ProfileInfo label="Contact Number" value="0912 345 6789" />
            <ProfileInfo label="Location" value="Sampaloc, Manila" />
          </div>
        </div>

        {/* ── Right column ───────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Account Overview — kept from original */}
          <div className="rounded-3xl border border-border bg-card-light p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-text-on-light">
              Account Overview
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Role", value: "System Administrator" },
                { label: "Department", value: "Operations Control" },
                { label: "Last Login", value: "May 24, 2026 · 08:11 AM" },
                { label: "Access Level", value: "Full Dashboard Access" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border p-4"
                >
                  <div className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                    {item.label}
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-text-on-light">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="rounded-3xl border border-border bg-card-light p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-text-on-light">
              Basic Information
            </h3>
            <div className="mt-4 divide-y divide-border">
              <ProfileRow label="First Name" value="Juan" />
              <ProfileRow label="Middle Name" value="Dela" />
              <ProfileRow label="Last Name" value="Cruz" />
              <ProfileRow label="Employee ID" value="123-4567" />
              <ProfileRow label="Gender" value="Male" />
              <ProfileRow label="Birthdate" value="January 01, 1999" />
              <ProfileRow label="Personal Email" value="juandc@email.com" />
            </div>
          </div>

          {/* Location */}
          <div className="rounded-3xl border border-border bg-card-light p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-text-on-light">
              Location
            </h3>
            <div className="mt-4 space-y-5">
              <AddressField label="Address Line 1" />
              <AddressField label="Address Line 2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-muted">
        {label}
      </div>
      <p className="mt-1 break-all text-sm font-medium text-text-on-light">
        {value}
      </p>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 py-3">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="col-span-2 text-sm font-medium text-text-on-light">
        {value}
      </span>
    </div>
  );
}

function AddressField({ label }: { label: string }) {
  return (
    <div>
      <div className="mb-1 text-xs text-text-muted">{label}</div>
      <p className="text-sm font-medium text-text-on-light">—</p>
    </div>
  );
}
