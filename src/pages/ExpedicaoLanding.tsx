import { Link } from 'react-router-dom'
import { ArrowRight, BedDouble, Camera, Check, MapPinned, Phone, ShieldCheck, Shirt, Sparkles, Users, UtensilsCrossed, Wrench } from 'lucide-react'
import TopBar from '../components/TopBar'
import './ExpedicaoFlow.css'

interface ExpedicaoLandingProps {
  registrationTarget?: string
  imageRoot?: string
  standalone?: boolean
}

const INCLUDED = [
  { icon: BedDouble, title: 'Hospedagem com café da manhã', description: 'Hospedagem especial para aproveitar os dias da expedição.' },
  { icon: UtensilsCrossed, title: 'Refeições incluídas', description: 'Jantar na sexta e no sábado. Almoço no sábado e no domingo. Bebidas não incluídas.' },
  { icon: Camera, title: 'Cobertura de mídia completa', description: 'Registros dos momentos e das experiências durante o evento.' },
  { icon: Shirt, title: 'Kit camiseta do evento', description: 'Informe os tamanhos do piloto e dos acompanhantes na inscrição.' },
  { icon: Sparkles, title: 'Confraternização à noite', description: 'Um encontro especial para aproveitar a companhia do grupo.' },
  { icon: ShieldCheck, title: 'Estrutura de apoio na trilha', description: 'Apoio para o grupo durante os passeios da expedição.' },
]

const PARTICIPATION = [
  {
    title: 'Escolha como participar',
    description: 'Inscreva-se como piloto individual ou informe quem vai acompanhar você.',
    icon: Users,
  },
  {
    title: 'Informe seu veículo',
    description: 'O formulário recebe UTVs, quadriciclos e 4x4. Se precisar alugar, indique a opção desejada.',
    icon: Wrench,
  },
  {
    title: 'Converse com a equipe',
    description: 'Depois do envio, a equipe entra em contato com o valor final e as orientações de pagamento.',
    icon: Check,
  },
]

const WHATSAPP = 'https://wa.me/5511964467000?text=' + encodeURIComponent('Olá! Gostaria de saber mais sobre a Expedição Monte Verde, de 6 a 8 de novembro de 2026.')

export default function ExpedicaoLanding({
  registrationTarget = '/inscricao',
  imageRoot = '/images',
  standalone = true,
}: ExpedicaoLandingProps) {
  return (
    <div className="monte-verde-flow">
      {standalone && <TopBar />}

      <section className="mv-hero" aria-labelledby="monte-verde-title">
        <div className="mv-wrap mv-hero-grid">
          <div className="mv-hero-copy">
            <span className="mono mv-hero-eyebrow">Usina do Jet · Expedição off-road</span>
            <h1 id="monte-verde-title" className="display mv-hero-title">Monte <span>Verde</span></h1>
            <p className="mv-hero-description">Três dias entre as trilhas da serra, a natureza e a boa companhia de quem vai com você.</p>
            <dl className="mv-hero-meta">
              <div><dt>Quando</dt><dd>06 a 08 de novembro de 2026</dd></div>
              <div><dt>Onde</dt><dd>Monte Verde, Minas Gerais</dd></div>
            </dl>
            <div className="mv-hero-actions">
              <Link to={registrationTarget} className="btn-primary">
                Quero minha vaga <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <a href="#mv-package-title" className="mv-package-link">Conhecer o pacote <ArrowRight size={16} aria-hidden="true" /></a>
            </div>
            <p className="mv-hero-investment"><span>Pacote casal</span><strong>R$ 5.590,00</strong></p>
          </div>
          <figure className="mv-hero-visual">
            <img
              src={imageRoot + '/MonteVerde.png'}
              alt="Arte da Expedição Monte Verde, com trilhas na serra e as marcas organizadoras."
              width={1672}
              height={941}
              fetchPriority="high"
            />
            <figcaption><span className="mono">06 — 08 NOV / 2026</span><span>Trilhas de Monte Verde e região</span></figcaption>
          </figure>
        </div>
      </section>

        <section className="mv-section" aria-labelledby="mv-about-title">
          <div className="mv-wrap mv-about">
            <div>
              <span className="eyebrow">A próxima expedição</span>
              <h2 id="mv-about-title" className="display mv-title">Um fim de semana para sair do asfalto.</h2>
            </div>
            <div className="mv-copy">
              <p>
                De <strong>6 a 8 de novembro de 2026</strong>, o destino é Monte Verde.
                Uma expedição off-road da Usina do Jet para reunir quem gosta de trilhas,
                natureza e de compartilhar o caminho.
              </p>
              <p>
                Você pode participar com seu UTV, quadriciclo ou 4x4, incluir acompanhantes
                na inscrição ou consultar a equipe sobre locação.
              </p>
              <p>
                O roteiro reúne passeios pelas principais trilhas de Monte Verde e da região,
                entre paisagens de serra e os encontros que fazem parte de cada expedição.
              </p>
              <div className="mv-facts">
                <span><MapPinned size={19} aria-hidden="true" /> Monte Verde</span>
                <span><Users size={19} aria-hidden="true" /> Pilotos e acompanhantes</span>
                <span><Wrench size={19} aria-hidden="true" /> UTV · Quadriciclo · 4x4</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mv-section mv-section-soft" aria-labelledby="mv-package-title">
          <div className="mv-wrap">
            <span className="eyebrow">Informações do pacote</span>
            <h2 id="mv-package-title" className="display mv-title">Trilha, descanso e bons encontros.</h2>
            <div className="mv-package-layout">
              <aside className="mv-price" aria-label="Investimento do pacote casal">
                <span className="mono">Pacote casal</span>
                <strong>R$ 5.590,00</strong>
                <p>Expedição Monte Verde<br />6 a 8 de novembro de 2026</p>
                <Link to={registrationTarget} className="btn-primary">
                  Fazer inscrição <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <small>Para outros grupos e locação de veículos, consulte o valor final com a equipe.</small>
              </aside>
              <div className="mv-included">
                {INCLUDED.map((item) => {
                  const Icon = item.icon
                  return (
                    <article key={item.title}>
                      <Icon size={23} aria-hidden="true" />
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mv-section mv-section-soft" aria-labelledby="mv-participation-title">
          <div className="mv-wrap">
            <span className="eyebrow">Da inscrição à viagem</span>
            <h2 id="mv-participation-title" className="display mv-title">Como participar.</h2>
            <div className="mv-participation">
              {PARTICIPATION.map((item, index) => {
                const Icon = item.icon
                return (
                  <article key={item.title} className="mv-participation-card">
                    <div className="mv-card-top">
                      <span className="mono">0{index + 1}</span>
                      <Icon size={23} aria-hidden="true" />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

      <section className="mv-section mv-contact" aria-labelledby="mv-contact-title">
        <div className="mv-wrap mv-about">
          <div>
            <span className="eyebrow">Planeje sua participação</span>
            <h2 id="mv-contact-title" className="display mv-title">Vamos combinar os detalhes?</h2>
          </div>
          <div className="mv-copy">
            <p>
              Fale com a equipe para combinar horários, ponto de encontro e
              as orientações para os passeios nas trilhas de Monte Verde e da região.
            </p>
            <p>
              Se precisar de um quadriciclo ou UTV, consulte os valores e a disponibilidade.
              A locação é tratada à parte com a equipe.
            </p>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <Phone size={17} aria-hidden="true" /> Conversar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="mv-section mv-final" aria-labelledby="mv-final-title">
        <div className="mv-wrap">
          <span className="eyebrow">06 a 08 de novembro de 2026</span>
          <h2 id="mv-final-title" className="display mv-title">Nos encontramos em Monte Verde.</h2>
          <p>Preencha sua inscrição e converse com a equipe sobre sua participação.</p>
          <Link to={registrationTarget} className="btn-primary">
            Fazer minha inscrição <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className="mv-footer">
        <div className="mv-wrap">
          <img src={imageRoot + '/logo%20usina%201000px%20x%201000px.png'} alt="Usina do Jet" width={60} height={60} loading="lazy" />
          <span className="mono">© 2026 Usina do Jet</span>
        </div>
      </footer>

    </div>
  )
}
