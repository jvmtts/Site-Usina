import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, CalendarDays, MapPinned } from 'lucide-react'
import { upcomingExpedition } from '../config/upcomingExpedition'
import './UpcomingExpedition.css'

export default function UpcomingExpedition() {
  return (
    <section className="upcoming-expedition" aria-labelledby="upcoming-expedition-title">
      <div className="wrap upcoming-expedition-grid">
        <div className="upcoming-expedition-copy">
          <span className="eyebrow">Próxima expedição · Off-road</span>
          <h1 id="upcoming-expedition-title" className="display">Expedição <span>{upcomingExpedition.name}</span></h1>
          <p>O próximo destino da Usina é Serra Negra, no interior de São Paulo. A data e o roteiro serão divulgados assim que estiverem confirmados.</p>

          <dl className="upcoming-expedition-status">
            <div>
              <dt><CalendarDays size={17} aria-hidden="true" /> Data</dt>
              <dd>A confirmar</dd>
            </div>
            <div>
              <dt><MapPinned size={17} aria-hidden="true" /> Roteiro</dt>
              <dd>A confirmar</dd>
            </div>
          </dl>

          <a className="btn-primary" href={upcomingExpedition.whatsapp} target="_blank" rel="noopener noreferrer">
            Garantir vaga <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <p className="upcoming-expedition-note">Fale com a equipe para registrar seu interesse e receber os detalhes quando estiverem disponíveis.</p>
          <Link className="upcoming-expedition-back" to="/expedicoes"><ArrowLeft size={15} aria-hidden="true" /> Todas as expedições</Link>
        </div>
        <figure className="upcoming-expedition-cover">
          <img src={upcomingExpedition.cover} alt="Arte ilustrativa da expedição off-road: UTV laranja seguido de quadriciclos numa estrada de terra" width={1672} height={941} fetchPriority="high" />
          <figcaption><span className="mono">Serra Negra · SP</span><span>Arte ilustrativa</span></figcaption>
        </figure>
      </div>
    </section>
  )
}
