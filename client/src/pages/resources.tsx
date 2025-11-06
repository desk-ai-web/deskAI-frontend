import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resources</h1>
          <p className="text-gray-600">
            Science-backed information about screen habits and health
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-12">
          {/* Posture and Back/Neck Health */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Posture and Back/Neck Health
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Poor sitting posture, like a hunched back, overstretches the
                spinal ligaments and increases pressure on the vertebrae and
                muscles. Over time this will damage your spine and lead to a
                range of neck and back problems [1, 2, 3]. To prevent this,
                research emphasizes maintaining a neutral spine – shoulders
                relaxed, core engaged, and head aligned [1, 3].
              </p>
              <p>
                While it is easy to sit straight for a moment, we often fall
                back into old patterns as soon as our attention shifts. The
                desk.ai app helps you become aware of posture issues during your
                screen work. Our Hunch Detection feature detects the classic
                slouched neck from your webcam and subtly notifies you to sit
                upright. In this way, the app reinforces a healthier posture
                until it sticks.
              </p>
            </div>
          </section>

          {/* No posture is perfect */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              No posture is perfect
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                A good posture puts less strain on your neck and back than a bad
                one, however, staying in any position for too long raises health
                risks. That means, even with a good posture, staying motionless
                strains muscles and joints and sitting for prolonged time is
                associated with cardiovascular problems and even cancer [4, 5].
                Experts commonly advise to interchange sitting intervals with
                standing, stretching or brief walks every 20-60 minutes [2, 6].
              </p>
              <p>
                That is why the desk.ai has developed the Move Break feature
                that alerts you if you have remained stationary for too long.
                This is your quick reminder to move if you have not in the past
                20-60 minutes to keep your muscles relaxed and your joints
                limber.
              </p>
            </div>
          </section>

          {/* Blinking and Eye Comfort */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Blinking and Eye Comfort
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                When we concentrate on a screen, we tend to blink much less.
                Normally people blink about 15–20 times per minute, which spreads
                tears over the eyes to keep them moisturized. But studies show
                that on screens the blink rate drops sharply to less than half [7,
                8]. Fewer (and more incomplete) blinks means the eyes get dryer
                [7]. Over time, this dryness can lead to irritation, burning,
                blurred vision and other symptoms of digital eye strain [7, 9,
                10, 11].
              </p>
              <p>
                Therefore, the message is clear - blink more! Sounds simple -
                but it's not. However, people often forget to blink when they
                focus on a screen [7, 11]. We believe that the best solution
                for this problem should remind you to blink when you forget to.
                That is why the Blink Detection by desk.ai tracks your blinks
                in real-time. After a while this conditions automatic blinking
                before the reminder shows up, leading to a higher blink-rate.
              </p>
              <p>
                Additionally, we offer the simple 20-20-20 rule, which is
                effective at minimizing eye strain [11]. Activating this rule
                will remind you every 20 minutes to look at something that is 20
                ft (6 m) away for 20 seconds to give your eyes regular breaks.
              </p>
            </div>
          </section>

          {/* Give yourself some space */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Give yourself some space
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                How far you sit from the screen matters for both your eyes and
                your posture. Ergonomics experts recommend placing your monitor
                at about 20-30'' (50-75 cm). This distance typically allows text
                to be read without squinting and avoids leaning. If the screen is
                too close, your eyes have to work harder to focus, and you may
                also lean forward or tilt your neck, adding stress to back and
                shoulder [7, 11].
              </p>
              <p>
                Once you have found your comfortable screen distance, you can use
                the Screen Distance feature to keep it. If you (sub-consciously)
                lean forward, the app will alert you until you are back in the
                comfortable distance.
              </p>
            </div>
          </section>

          {/* Conclusion */}
          <section className="pt-8 border-t border-gray-200">
            <p className="text-lg text-gray-700 leading-relaxed">
              Overall, desk.ai translates scientific guidance into everyday
              reminders, helping you adjust your screen habits for better
              comfort.
            </p>
          </section>

          {/* References */}
          <section className="pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              References
            </h3>
            <ol className="list-decimal ml-6 space-y-3 text-sm text-gray-600 break-words">
              <li>
                UCLA Health. (n.d.). Ergonomics for prolonged sitting.{' '}
                <a
                  href="https://www.uclahealth.org/medical-services/spine/patient-resources/ergonomics-prolonged-sitting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  https://www.uclahealth.org/medical-services/spine/patient-resources/ergonomics-prolonged-sitting
                </a>
              </li>
              <li>
                Harvard Health Publishing. (2023, July 20). 3 surprising risks of poor posture.{' '}
                <a
                  href="https://www.health.harvard.edu/staying-healthy/3-surprising-risks-of-poor-posture"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  https://www.health.harvard.edu/staying-healthy/3-surprising-risks-of-poor-posture
                </a>
              </li>
              <li>
                Borhany, T., Shahid, E., Siddique, W. A., & Ali, H. (2018). Musculoskeletal problems in frequent computer and internet users. Journal of family medicine and primary care, 7(2), 337–339.{' '}
                <a
                  href="https://doi.org/10.4103/jfmpc.jfmpc_326_17"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  https://doi.org/10.4103/jfmpc.jfmpc_326_17
                </a>
              </li>
              <li>
                Dong, Y., Jiang, P., Jin, X., Jiang, N., Huang, W., Peng, Y., Shen, Y., He, L., Forsman, M., & Yang, L. (2022). Association between long-term static postures exposure and musculoskeletal disorders among university employees: A viewpoint of inflammatory pathways. Frontiers in public health, 10, 1055374.{' '}
                <a
                  href="https://doi.org/10.3389/fpubh.2022.1055374"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  https://doi.org/10.3389/fpubh.2022.1055374
                </a>
              </li>
              <li>
                Ihira, H., Sawada, N., Yamaji, T., Goto, A., Shimazu, T., Kikuchi, H., Inoue, S., Inoue, M., Iwasaki, M., Tsugane, S., & Japan Public Health Center-based Prospective (JPHC) Study Group (2020). Occupational sitting time and subsequent risk of cancer: The Japan Public Health Center-based Prospective Study. Cancer science, 111(3), 974–984.{' '}
                <a
                  href="https://doi.org/10.1111/cas.14304"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  https://doi.org/10.1111/cas.14304
                </a>
              </li>
              <li>
                Wong, A. Y. L., Chan, T. P. M., Chau, A. W. M., Cheung, H. T., Kwan, K. C. K., Lam, A. K. H., Wong, P. Y. C., & De Carvalho, D. (2019). Do different sitting postures affect spinal biomechanics of asymptomatic individuals? Gait & Posture, 67, 230–235.{' '}
                <a
                  href="https://doi.org/10.1016/j.gaitpost.2018.10.028"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  https://doi.org/10.1016/j.gaitpost.2018.10.028
                </a>
              </li>
              <li>
                Cassidy, S. (2021, August 27). Blink and you’ll miss it: Computer vision syndrome and managing eye health in a new era of online learning and teaching. Applied Cognition Research Group, University of Salford.{' '}
                <a
                  href="https://hub.salford.ac.uk/appliedcognition/2021/08/27/2068/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  https://hub.salford.ac.uk/appliedcognition/2021/08/27/2068/
                </a>
              </li>
              <li>
                Al-Mohtaseb, Z., Schachter, S., Shen Lee, B., Garlich, J., & Trattler, W. (2021). The Relationship Between Dry Eye Disease and Digital Screen Use. Clinical ophthalmology (Auckland, N.Z.), 15, 3811–3820.{' '}
                <a
                  href="https://doi.org/10.2147/OPTH.S321591"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  https://doi.org/10.2147/OPTH.S321591
                </a>
              </li>
              <li>
                American Optometric Association & Deloitte Access Economics. (2024, January). The impact of unmanaged excessive screen time in the United States [Report].{' '}
                <a
                  href="https://www.aoa.org/AOA/Documents/Eye%20Deserve%20More/Cost%20of%20Unmanaged%20Screen%20Time%20Report_FINAL.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  https://www.aoa.org/AOA/Documents/Eye%20Deserve%20More/Cost%20of%20Unmanaged%20Screen%20Time%20Report_FINAL.pdf
                </a>
              </li>
              <li>
                Carlson, T., Tovar, D. A., Alink, A., & Kriegeskorte, N. (2013). Representational dynamics of object vision: The first 1000 ms. Journal of Vision, 13(10), 1–1.{' '}
                <a
                  href="https://doi.org/10.1167/13.10.1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  https://doi.org/10.1167/13.10.1
                </a>
              </li>
              <li>
                Kaur, K., Gurnani, B., Nayak, S., Deori, N., Kaur, S., Jethani, J., Singh, D., Agarkar, S., Hussaindeen, J. R., Sukhija, J., & Mishra, D. (2022). Digital Eye Strain- A Comprehensive Review. Ophthalmology and therapy, 11(5), 1655–1680.{' '}
                <a
                  href="https://doi.org/10.1007/s40123-022-00540-9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  https://doi.org/10.1007/s40123-022-00540-9
                </a>
              </li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

