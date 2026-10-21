import FaqItem from './FaqItem.jsx'

const FAQ = Object.freeze([
  {
    q: 'What is an alert?',
    a: 'An alert is a security event your sensor flags, such as suspicious traffic or a known pattern. Each alert shows the devices, destination, time and risk level so you can act on it.',
  },
  {
    q: 'What does Urgent mean?',
    a: 'Urgent (CRITICAL) means the event needs your attention first. These alerts carry the biggest penalty to your security score and are listed at the top.',
  },
  {
    q: 'What if my sensor is offline?',
    a: 'If your sensor stops reporting, the dashboard shows an offline banner. Check power and the network connection between your sensor and the internet, then open a support request if it stays offline.',
  },
  {
    q: 'What does "This is expected" do?',
    a: '"This is expected" marks an alert as normal for your environment (for example, a planned backup). The alert stays visible and we record the feedback for the SOC team — it does not hide the event.',
  },
])

/**
 * FAQ accordion in plain language.
 * @returns {JSX.Element}
 */
export default function FaqAccordion() {
  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-text">Frequently asked questions</h2>
      <div className="mt-1 divide-y divide-border">
        {FAQ.map((item) => (
          <FaqItem key={item.q} question={item.q} answer={item.a} />
        ))}
      </div>
    </section>
  )
}
