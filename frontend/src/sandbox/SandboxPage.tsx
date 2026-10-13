import { useState } from 'react'
import { Button } from '@/components/ui/atoms/Button'
import { Badge } from '@/components/ui/atoms/Badge'
import { Avatar } from '@/components/ui/atoms/Avatar'
import { Input } from '@/components/ui/atoms/Input'
import { IconButton } from '@/components/ui/atoms/IconButton'
import { Icon, type IconName } from '@/components/ui/atoms/Icon'

import { Alert } from '@/components/ui/molecules/Alert'
import { DayChip } from '@/components/ui/molecules/DayChip'
import { SessionCard } from '@/components/ui/molecules/SessionCard'
import { PlanCard } from '@/components/ui/molecules/PlanCard'
import { NextBookingCard } from '@/components/ui/molecules/NextBookingCard'
import { MemberListItem } from '@/components/ui/molecules/MemberListItem'
import { QuickAccessTile } from '@/components/ui/molecules/QuickAccessTile'
import { FeatureItem } from '@/components/ui/molecules/FeatureItem'
import { FeaturedClassCard } from '@/components/ui/molecules/FeaturedClassCard'
import { CapacitySummary } from '@/components/ui/molecules/CapacitySummary'
import { EnrolledMemberRow } from '@/components/ui/molecules/EnrolledMemberRow'
import { Pagination } from '@/components/ui/molecules/Pagination'

import { WeekSelector } from '@/components/ui/organisms/WeekSelector'
import { SessionList, type SessionListItem } from '@/components/ui/organisms/SessionList'
import { EnrolledMembersPanel } from '@/components/ui/organisms/EnrolledMembersPanel'
import { MembersList, type MemberListEntry } from '@/components/ui/organisms/MembersList'
import { QuickAccessGrid } from '@/components/ui/organisms/QuickAccessGrid'
import { Table } from '@/components/ui/organisms/Table'
import { PlansSection } from '@/components/ui/organisms/PlansSection'
import { FeaturedClassesSection } from '@/components/ui/organisms/FeaturedClassesSection'
import { BenefitsSection } from '@/components/ui/organisms/BenefitsSection'
import { HeroSection } from '@/components/ui/organisms/HeroSection'
import { LandingFooter } from '@/components/ui/organisms/LandingFooter'

/* ------------------------------------------------------------------ */
/* Mock data (no backend needed)                                       */
/* ------------------------------------------------------------------ */

const ALL_ICONS: IconName[] = [
  'home',
  'users',
  'dumbbell',
  'calendar',
  'calendar-plus',
  'settings',
  'log-out',
  'plus',
  'search',
  'check',
  'x',
  'chevron-left',
  'chevron-right',
  'alert-triangle',
]

const SESSIONS: SessionListItem[] = [
  {
    id: 1,
    title: 'Cross Training',
    time: '10:00 – 11:00',
    room: 'Sala 1',
    enrolled: 8,
    capacity: 12,
    attendees: [
      { id: 1, name: 'Laura García' },
      { id: 2, name: 'Marc Pujol' },
      { id: 3, name: 'Ana López' },
      { id: 4, name: 'Jordi Vidal' },
    ],
  },
  {
    id: 2,
    title: 'Yoga Flow',
    time: '12:00 – 13:00',
    room: 'Sala 2',
    enrolled: 10,
    capacity: 10,
    attendees: [
      { id: 5, name: 'Nuria Serra' },
      { id: 6, name: 'Pau Martí' },
    ],
  },
  {
    id: 3,
    title: 'Spinning',
    time: '18:00 – 19:00',
    room: 'Sala 3',
    enrolled: 3,
    capacity: 15,
    attendees: [],
  },
]

const MEMBERS: MemberListEntry[] = [
  {
    id: 1,
    name: 'Laura García',
    email: 'laura@example.com',
    planName: 'Premium',
    membershipStatus: 'active',
    lastPayment: { amountCents: 4900, date: '2026-09-01', status: 'paid' },
  },
  {
    id: 2,
    name: 'Marc Pujol',
    email: 'marc@example.com',
    planName: 'Básico',
    membershipStatus: 'expired',
    lastPayment: { amountCents: 2900, date: '2026-08-01', status: 'failed' },
  },
  {
    id: 3,
    name: 'Ana López',
    email: 'ana@example.com',
    planName: null,
    membershipStatus: null,
    lastPayment: null,
  },
]

const ENROLLED = [
  { id: 1, name: 'Laura García', memberNumber: 101, time: '09:15' },
  { id: 2, name: 'Marc Pujol', memberNumber: 102, time: '09:20' },
  { id: 3, name: 'Ana López', memberNumber: 103, time: '09:45' },
  { id: 4, name: 'Jordi Vidal', memberNumber: 104, time: '10:02' },
]

const TABLE_ROWS = [
  { id: 1, concepto: 'Cuota Premium', socio: 'Laura García', importe: '49,00 €', estado: 'Pagado' },
  { id: 2, concepto: 'Cuota Básica', socio: 'Marc Pujol', importe: '29,00 €', estado: 'Fallido' },
]

/* ------------------------------------------------------------------ */
/* Layout helpers                                                      */
/* ------------------------------------------------------------------ */

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="flex flex-col gap-4 rounded-card bg-surface-sunken p-6">
      <h2 className="font-display text-headline text-primary">{title}</h2>
      {children}
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>
}

/* ------------------------------------------------------------------ */
/* Sandbox                                                             */
/* ------------------------------------------------------------------ */

export function SandboxPage() {
  const [selectedDate, setSelectedDate] = useState('2026-10-12')
  const [page, setPage] = useState(2)
  const [panelOpen, setPanelOpen] = useState(true)

  return (
    <main className="flex flex-col gap-6 bg-canvas p-6 text-text" style={{ minHeight: '100vh' }}>
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-hero text-primary">🎨 Component sandbox</h1>
        <p className="text-body text-text-muted">
          Vista previa de los componentes con datos de ejemplo. Sin backend.
        </p>
      </header>

      {/* ============================ ATOMS ============================ */}
      <Section id="button" title="Atoms / Button">
        <Row>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="white">White</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
        </Row>
        <Row>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button isLoading>Cargando</Button>
          <Button disabled>Disabled</Button>
          <Button leftIcon="plus" rightIcon="chevron-right">
            Con iconos
          </Button>
          <Button fullWidth>Full width</Button>
        </Row>
      </Section>

      <Section id="icon-button" title="Atoms / IconButton">
        <Row>
          <IconButton icon="settings" label="Ajustes" variant="surface" />
          <IconButton icon="plus" label="Añadir" variant="primary" />
          <IconButton icon="x" label="Cerrar" variant="ghost" />
          <IconButton icon="search" label="Buscar" size="sm" />
          <IconButton icon="calendar" label="Calendario" size="lg" />
        </Row>
      </Section>

      <Section id="input" title="Atoms / Input">
        <div className="flex max-w-md flex-col gap-4">
          <Input placeholder="Buscar…" leftIcon="search" />
          <Input placeholder="Contraseña" type="password" leftIcon="settings" />
          <Input placeholder="Con error" invalid defaultValue="valor inválido" />
          <Input placeholder="Deshabilitado" disabled />
          <Input
            placeholder="Con botón a la derecha"
            rightSlot={<IconButton icon="check" label="Confirmar" variant="ghost" size="sm" />}
          />
        </div>
      </Section>

      <Section id="badge" title="Atoms / Badge">
        <Row>
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="primary">Primary</Badge>
          <Badge tone="secondary">Secondary</Badge>
          <Badge tone="info">Info</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
          <Badge tone="success" dot>
            Con punto
          </Badge>
          <Badge tone="primary" uppercase>
            Plan premium
          </Badge>
        </Row>
      </Section>

      <Section id="avatar" title="Atoms / Avatar">
        <Row>
          <Avatar name="Laura García" size="sm" />
          <Avatar name="Laura García" size="md" />
          <Avatar name="Laura García" size="lg" />
          <Avatar name="Marc Pujol" status="verified" />
          <Avatar name="Ana López" status="online" />
          <Avatar name="Foto rota" src="/no-existe.png" />
        </Row>
      </Section>

      <Section id="icon" title="Atoms / Icon (todos los nombres)">
        <Row>
          {ALL_ICONS.map((name) => (
            <span
              key={name}
              className="flex flex-col items-center gap-1 text-caption text-text-muted"
            >
              <Icon name={name} size={24} />
              {name}
            </span>
          ))}
        </Row>
      </Section>

      {/* ========================== MOLECULES ========================== */}
      <Section id="alert" title="Molecules / Alert">
        <Alert variant="info" title="Información">
          Este es un mensaje informativo.
        </Alert>
        <Alert variant="success" title="Hecho">
          Reserva confirmada.
        </Alert>
        <Alert variant="warning" title="Atención">
          La clase está a punto de llenarse.
        </Alert>
        <Alert variant="error" title="Error">
          No se pudo cargar la sesión.
        </Alert>
      </Section>

      <Section id="day-chip" title="Molecules / DayChip">
        <Row>
          <DayChip day="Lun" date={12} hasSessions />
          <DayChip day="Mar" date={13} isSelected hasSessions />
          <DayChip day="Mié" date={14} />
          <DayChip day="Jue" date={15} hasSessions />
        </Row>
      </Section>

      <Section id="session-card" title="Molecules / SessionCard">
        <div className="grid gap-4 sm:grid-cols-2">
          <SessionCard
            title="Cross Training"
            time="10:00 – 11:00"
            room="Sala 1"
            enrolled={8}
            capacity={12}
            attendees={SESSIONS[0].attendees}
            role="trainer"
            onAction={() => alert('Ver inscritos')}
          />
          <SessionCard
            title="Yoga Flow"
            time="10:00 – 11:00"
            room="Sala 2"
            enrolled={10}
            capacity={10}
            role="member"
            state="full"
          />
          <SessionCard
            title="Spinning"
            time="18:00 – 19:00"
            room="Sala 3"
            enrolled={3}
            capacity={15}
            attendees={SESSIONS[2].attendees}
            role="member"
            state="available"
          />
          <SessionCard
            title="Pilates"
            time="19:00 – 20:00"
            room="Sala 1"
            enrolled={6}
            capacity={12}
            role="member"
            state="booked"
          />
        </div>
      </Section>

      <Section id="plan-card" title="Molecules / PlanCard">
        <div className="grid gap-4 sm:grid-cols-2">
          <PlanCard
            name="Básico"
            priceCents={2900}
            durationDays={30}
            description="Acceso a sala de musculación."
            features={['Horario restringido']}
          >
            <Button variant="secondary" fullWidth>
              Elegir
            </Button>
          </PlanCard>
          <PlanCard
            name="Premium"
            priceCents={4900}
            durationDays={30}
            description="Acceso completo a todas las clases."
            features={['Todas las clases', 'Entrenador personal', 'Sin permanencia']}
            highlighted
          >
            <Button variant="white" fullWidth>
              Elegir
            </Button>
          </PlanCard>
        </div>
      </Section>

      <Section id="next-booking" title="Molecules / NextBookingCard">
        <div className="grid gap-4 sm:grid-cols-2">
          <NextBookingCard
            booking={{
              id: 1,
              className: 'Cross Training',
              date: 'Lun 12 oct',
              time: '10:00 – 11:00',
              room: 'Sala 1',
              trainer: 'Jordi Vidal',
            }}
            onCancel={(id) => alert(`Cancelar reserva ${id}`)}
          />
          <NextBookingCard booking={null} />
        </div>
      </Section>

      <Section id="member-item" title="Molecules / MemberListItem">
        <div className="flex flex-col gap-3">
          {MEMBERS.map((member) => (
            <MemberListItem
              key={member.id}
              name={member.name}
              email={member.email}
              planName={member.planName}
              membershipStatus={member.membershipStatus}
              lastPayment={member.lastPayment}
            >
              <Button size="sm" variant="secondary">
                Ver
              </Button>
              <Button size="sm" variant="ghost">
                Editar
              </Button>
            </MemberListItem>
          ))}
        </div>
      </Section>

      <Section
        id="small-molecules"
        title="Molecules / QuickAccessTile · FeatureItem · FeaturedClassCard · CapacitySummary · EnrolledMemberRow · Pagination"
      >
        <Row>
          <QuickAccessTile icon="calendar" label="Reservar" to="/sandbox" />
          <QuickAccessTile icon="dumbbell" label="Clases" to="/sandbox" />
        </Row>
        <div className="grid gap-4 sm:grid-cols-3">
          <FeatureItem
            icon="calendar"
            title="Reserva fácil"
            text="Reserva tus clases en segundos desde el móvil."
          />
          <FeaturedClassCard
            name="Cross Training"
            schedule="Lunes 10:00 – 11:00"
            capacity={12}
            trainerName="Jordi Vidal"
          />
          <div className="flex flex-col gap-4">
            <CapacitySummary enrolled={8} capacity={12} />
            <CapacitySummary enrolled={10} capacity={10} />
            <EnrolledMemberRow name="Laura García" memberNumber={101} time="09:15" />
          </div>
        </div>
        <Pagination page={page} pages={5} onChange={setPage} />
      </Section>

      {/* ========================== ORGANISMS ========================== */}
      <Section id="week-selector" title="Organisms / WeekSelector">
        <WeekSelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          sessionDates={['2026-10-12', '2026-10-15', '2026-10-17']}
        />
        <p className="text-small text-text-muted">Fecha seleccionada: {selectedDate}</p>
      </Section>

      <Section id="session-list" title="Organisms / SessionList (rol trainer + estados)">
        <SessionList sessions={SESSIONS} role="trainer" onAction={(id) => alert(`Sesión ${id}`)} />
        <SessionList sessions={SESSIONS} role="member" />
        <SessionList sessions={[]} role="member" isLoading />
        <SessionList sessions={[]} role="member" error="No se pudieron cargar las sesiones." />
        <SessionList sessions={[]} role="member" />
      </Section>

      <Section id="enrolled-panel" title="Organisms / EnrolledMembersPanel">
        <Row>
          <Button variant="secondary" onClick={() => setPanelOpen((open) => !open)}>
            {panelOpen ? 'Ocultar' : 'Mostrar'} panel
          </Button>
        </Row>
        {panelOpen ? (
          <EnrolledMembersPanel
            title="Cross Training"
            date="Lun 12 oct · 10:00 – 11:00"
            enrolled={4}
            capacity={12}
            members={ENROLLED}
            onClose={() => setPanelOpen(false)}
          />
        ) : null}
      </Section>

      <Section id="members-list" title="Organisms / MembersList">
        <MembersList
          members={MEMBERS}
          page={2}
          pages={4}
          onSearch={(value) => alert(`Buscar: ${value}`)}
          onPageChange={setPage}
          renderActions={(member) => (
            <Button size="sm" variant="secondary">
              Ver socio {member.id}
            </Button>
          )}
        />
      </Section>

      <Section id="quick-access-grid" title="Organisms / QuickAccessGrid">
        <QuickAccessGrid
          items={[
            { icon: 'calendar', label: 'Reservar', to: '/sandbox' },
            { icon: 'dumbbell', label: 'Clases', to: '/sandbox' },
            { icon: 'users', label: 'Socios', to: '/sandbox' },
            { icon: 'settings', label: 'Ajustes', to: '/sandbox' },
          ]}
        />
      </Section>

      <Section id="table" title="Organisms / Table">
        <Table
          columns={[
            { key: 'concepto', header: 'Concepto' },
            { key: 'socio', header: 'Socio' },
            { key: 'importe', header: 'Importe' },
            {
              key: 'estado',
              header: 'Estado',
              render: (row) => (
                <Badge tone={row.estado === 'Pagado' ? 'success' : 'danger'}>{row.estado}</Badge>
              ),
            },
          ]}
          rows={TABLE_ROWS}
          rowKey={(row) => row.id}
        />
        <Table columns={[{ key: 'a', header: 'Vacío' }]} rows={[]} rowKey={(row) => row.id} />
        <Table
          columns={[{ key: 'a', header: 'Cargando' }]}
          rows={[]}
          rowKey={(row) => row.id}
          isLoading
        />
      </Section>

      <Section
        id="landing-sections"
        title="Organisms / Landing (Hero · Benefits · FeaturedClasses · Plans · Footer)"
      >
        <HeroSection
          title="Entrena a tu ritmo"
          subtitle="Reserva clases de guía con los mejores entrenadores, cuando quieras."
          actions={
            <>
              <Button>Empezar ahora</Button>
              <Button variant="secondary">Ver planes</Button>
            </>
          }
        />
        <BenefitsSection
          items={[
            {
              icon: 'calendar',
              title: 'Reserva fácil',
              text: 'Reserva en segundos desde el móvil.',
            },
            { icon: 'dumbbell', title: 'Variedad', text: 'Más de 20 clases cada semana.' },
            { icon: 'users', title: 'Comunidad', text: 'Entrena acompañado y motívate.' },
          ]}
        />
        <FeaturedClassesSection
          classes={[
            {
              id: 1,
              name: 'Cross Training',
              schedule: 'Lunes 10:00 – 11:00',
              capacity: 12,
              trainerName: 'Jordi Vidal',
            },
            {
              id: 2,
              name: 'Yoga Flow',
              schedule: 'Martes 12:00 – 13:00',
              capacity: 10,
              trainerName: 'Nuria Serra',
            },
          ]}
        />
        <PlansSection
          plans={[
            {
              id: 1,
              name: 'Básico',
              priceCents: 2900,
              durationDays: 30,
              description: 'Sala de musculación.',
            },
            {
              id: 2,
              name: 'Premium',
              priceCents: 4900,
              durationDays: 30,
              description: 'Acceso completo.',
            },
          ]}
          renderAction={(plan) => (
            <Button variant="secondary" fullWidth>
              Elegir {plan.name}
            </Button>
          )}
        />
        <LandingFooter actions={<Button>Únete hoy</Button>} />
      </Section>

      {/* Estados de loading / error / vacío de las secciones de landing */}
      <Section id="landing-states" title="Organisms / Landing estados (carga · error · vacío)">
        <FeaturedClassesSection classes={[]} isLoading />
        <FeaturedClassesSection classes={[]} error="No se pudieron cargar las clases." />
        <FeaturedClassesSection classes={[]} />
        <PlansSection plans={[]} isLoading />
        <PlansSection plans={[]} error="No se pudieron cargar los planes." />
        <PlansSection plans={[]} />
      </Section>
    </main>
  )
}
