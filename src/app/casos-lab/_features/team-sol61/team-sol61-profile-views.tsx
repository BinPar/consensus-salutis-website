"use client";

import { ArrowUpRight } from "lucide-react";
import {
  teamSol61AreaCopy,
  teamSol61Joined,
  teamSol61Members,
} from "./team-sol61-data";
import {
  ContactActions,
  Eyebrow,
  MemberBio,
  MemberFacts,
  MemberLink,
  Portrait,
  ProfileBack,
  ProfileNeighbors,
  Scene,
  type ProfileViewProps,
} from "./team-sol61-visuals";
import { Filmstrip } from "./team-sol61-team-views";

export function EditorialProfile(props: ProfileViewProps) {
  const { member, onBack } = props;
  return (
    <article className="ts-profile ts-profile-editorial ts-container">
      <ProfileBack onBack={onBack} />
      <div className="ts-editorial-profile-opening">
        <div>
          <Eyebrow>Personas · {member.area}</Eyebrow>
          <h1 tabIndex={-1} className="ts-display font-display">
            {member.name}
          </h1>
          <p className="ts-profile-role">{member.role}</p>
          <p className="ts-profile-intro">{member.intro}</p>
          <span className="ts-edition">
            BinPar · Perfil {String(member.portrait + 1).padStart(2, "0")}
          </span>
        </div>
        <Portrait member={member} priority />
      </div>
      <section className="ts-editorial-profile-reading">
        <div>
          <Eyebrow>Su perspectiva</Eyebrow>
          <h2 className="font-display">
            Una manera propia
            <br />
            de aportar.
          </h2>
          <MemberBio member={member} />
        </div>
        <aside>
          <Eyebrow>En pocas palabras</Eyebrow>
          <p className="ts-profile-focus">{member.focus}</p>
          <MemberFacts member={member} />
          <ContactActions member={member} />
        </aside>
      </section>
      <ProfileNeighbors {...props} />
    </article>
  );
}

export function IndexProfile(props: ProfileViewProps) {
  const { member, onBack } = props;
  return (
    <article className="ts-profile ts-profile-index ts-container">
      <ProfileBack onBack={onBack} />
      <header className="ts-index-profile-title">
        <Eyebrow>
          Índice de personas · {String(member.portrait + 1).padStart(2, "0")} /
          16
        </Eyebrow>
        <h1 tabIndex={-1} className="ts-display font-display">
          {member.name}
          <span className="ts-index-title-dot">.</span>
        </h1>
        <p>
          {member.role} <span>↗</span> {member.area}
        </p>
      </header>
      <div className="ts-index-profile-layout">
        <aside className="ts-index-profile-portrait">
          <Portrait member={member} priority />
          <p className="ts-edition">BINPAR / {member.joined?.slice(0, 4)}</p>
        </aside>
        <div className="ts-index-record">
          <section>
            <Eyebrow>01 · Perfil</Eyebrow>
            <h2 className="font-display">{member.intro}</h2>
            <MemberBio member={member} />
          </section>
          <section>
            <Eyebrow>02 · Enfoque profesional</Eyebrow>
            <p className="ts-profile-focus">{member.focus}</p>
            <MemberFacts member={member} />
          </section>
          <section>
            <Eyebrow>03 · Sigamos en contacto</Eyebrow>
            <ContactActions member={member} />
          </section>
        </div>
      </div>
      <ProfileNeighbors {...props} />
    </article>
  );
}

export function WeaveProfile(props: ProfileViewProps) {
  const { member, onBack } = props;
  const colleagues = teamSol61Members.filter(
    (item) => item.area === member.area && item.slug !== member.slug,
  );
  return (
    <article className="ts-profile ts-profile-weave ts-container">
      <ProfileBack onBack={onBack} />
      <div className="ts-weave-profile-breadcrumb">
        <span>BinPar</span>
        <span>{member.area}</span>
        <span>{member.name}</span>
      </div>
      <div className="ts-weave-profile-layout">
        <div className="ts-weave-person-detail">
          <div className="ts-weave-person-heading">
            <Portrait member={member} priority />
            <div>
              <Eyebrow>{member.area}</Eyebrow>
              <h1 tabIndex={-1} className="font-display">
                {member.name}
              </h1>
              <p className="ts-profile-role">{member.role}</p>
            </div>
          </div>
          <div className="ts-weave-person-bio">
            <Eyebrow>Una perspectiva que suma</Eyebrow>
            <h2 className="font-display">{member.intro}</h2>
            <MemberBio member={member} />
            <MemberFacts member={member} />
            <ContactActions member={member} />
          </div>
        </div>
        <aside className="ts-weave-profile-context">
          <Eyebrow>Su ámbito en el conjunto</Eyebrow>
          <h2 className="font-display">{member.area}</h2>
          <Scene scene={teamSol61AreaCopy[member.area].scene} />
          <p>{teamSol61AreaCopy[member.area].description}</p>
          {colleagues.length > 0 ? (
            <>
              <p className="ts-weave-colleague-label">
                Más personas en {member.area.toLowerCase()}
              </p>
              {colleagues.map((item) => (
                <MemberLink
                  {...props}
                  member={item}
                  key={item.slug}
                  className="ts-weave-member"
                >
                  <Portrait key="content-0" member={item} />
                  <div key="content-1">
                    <h3>{item.name}</h3>
                    <p>{item.role}</p>
                  </div>
                  <ArrowUpRight key="content-2" size={14} strokeWidth={1.8} />
                </MemberLink>
              ))}
            </>
          ) : (
            <p className="ts-weave-colleague-label">
              Conoce al resto de personas que completan el equipo.
            </p>
          )}
        </aside>
      </div>
      <ProfileNeighbors {...props} />
    </article>
  );
}

export function ChaptersProfile(props: ProfileViewProps) {
  const { member, onBack } = props;
  const joined = teamSol61Joined(member);
  return (
    <article className="ts-profile ts-profile-chapters">
      <div className="ts-container">
        <ProfileBack onBack={onBack} />
        <header className="ts-chapters-profile-title">
          <Eyebrow>Historias del equipo · {member.area}</Eyebrow>
          <h1 tabIndex={-1} className="ts-display font-display">
            {member.name}
          </h1>
          <p className="ts-profile-role">{member.role}</p>
        </header>
        <div className="ts-chapters-profile-layout">
          <aside className="ts-chapters-profile-portrait">
            <Portrait member={member} priority />
            <p>{joined && <>En BinPar desde {joined}</>}</p>
          </aside>
          <div className="ts-chapters-profile-story">
            <section>
              <Eyebrow>01 · Una forma de entender el trabajo</Eyebrow>
              <h2 className="font-display">{member.intro}</h2>
              <MemberBio member={member} />
            </section>
            <section className="ts-chapters-story-focus">
              <Eyebrow>02 · Lo que le mueve</Eyebrow>
              <h2 className="font-display">{member.focus}</h2>
              <Scene scene={teamSol61AreaCopy[member.area].scene} />
            </section>
            <section>
              <Eyebrow>03 · Una conversación pendiente</Eyebrow>
              <h2 className="font-display">Conocer es el primer paso.</h2>
              <ContactActions member={member} />
            </section>
          </div>
        </div>
        <ProfileNeighbors {...props} />
      </div>
    </article>
  );
}

export function FocusProfile(props: ProfileViewProps) {
  const { member, onBack, onSelect } = props;
  return (
    <article className="ts-profile-focus">
      <section className="ts-focus-stage">
        <div className="ts-container">
          <ProfileBack onBack={onBack} />
          <div className="ts-focus-profile-opening">
            <div className="ts-focus-photo">
              <Portrait member={member} priority />
              <span className="ts-focus-photo-caption">
                Personas con nombre propio.
              </span>
            </div>
            <div className="ts-focus-profile-title">
              <Eyebrow>{member.area} · BinPar</Eyebrow>
              <h1 tabIndex={-1} className="ts-display font-display">
                {member.name}
              </h1>
              <p className="ts-focus-role">{member.role}</p>
              <p className="ts-focus-description">{member.intro}</p>
              <ContactActions member={member} />
            </div>
          </div>
          <Filmstrip member={member} onSelect={onSelect} />
        </div>
      </section>
      <section className="ts-container ts-focus-profile-reading">
        <div>
          <Eyebrow>Una mirada más cercana</Eyebrow>
          <h2 className="font-display">Conoce su perspectiva.</h2>
          <MemberBio member={member} />
        </div>
        <aside>
          <Eyebrow>Una aportación al conjunto</Eyebrow>
          <p className="ts-profile-focus">{member.focus}</p>
          <MemberFacts member={member} />
        </aside>
      </section>
      <div className="ts-container">
        <ProfileNeighbors {...props} />
      </div>
    </article>
  );
}
