# روش‌های Value-Based


## مقدمه

روش‌های Value-based از قدیمی‌ترین و شاید کامل‌ترین شاخه‌های بررسی‌شده توی Reinforcement Learning (RL) هستن. این روش‌ها مستقیم از کارای ریچارد بلمن تو دههٔ ۱۹۵۰ روی **dynamic programming (DP)** میان؛ جایی که اون اصل بهینگی و معادلات Bellman رو معرفی کرد که هنوزم ستون فقرات RL مدرنه.  
یه الگوریتم *Value-based* در واقع هر روشی‌ه که هستهٔ محاسباتیش یه **value function** ــ یه عدد برای حدسِ سود آینده ــ باشه، نه نمایش صریح logits یه policy (مثل روش‌های policy-gradient) و نه ترکیب هر دو بخش با هم (مثل actor–critic).

تعریفی بخوام بگم، یه value function رو می‌شه با دوتا دقت زیر تعریف کرد:

* **States:** *state-value* $V^\pi(s)$ توضیح می‌ده اگه با policy $ \pi $ تو state $s$ باشیم در بلندمدت چقدر می‌صرفه.
* **State–اکشن pairs:** *اکشن-value* $Q^\pi(s,a)$ همین حرفو دقیق‌تر می‌کنه چون اکشن بعدی رو هم تو حساب میاره.

چیزی که Value-based رو خاص می‌کنه **bootstrapping**ـه: برآورد یه state تا حدی به حدس خودش تو قدم‌های بعدی تکیه می‌کنه. bootstrapping وقتی (i) *dynamic programming* داریم و مدل Markov decision process (MDP) رو کامل می‌شناسیم، یا (ii) *temporal-difference (TD) learning* داریم و فقط دادهٔ نمونه‌گیری‌شده از محیط دم دستمونه، خیلی خوب جواب می‌ده.

### جایگاه تو طبقه‌بندی RL

| روش                 | چیزی که یاد می‌گیریم                | درآوردن policy                                         | مزیت‌های معمول                                               | چالش‌های رایج                                         |
| ------------------- | ----------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------- |
| **Value-based**     | $V$ یا $Q$                          | Greedy یا $\epsilon$-greedy نسبت به $Q$                | صرفه‌جویی داده به خاطر bootstrapping؛ تئوری جاافتاده         | ناپایداری زیر approximation تابع؛ بایاس بیش/کم-برآورد |
| **Policy-gradient** | پارامترهای تصادفی policy $\theta$   | مستقیم                                                 | اکشن‌های پیوسته رو خوب هندل می‌کنه؛ exploration ذاتاً تصادفی | گرادیان‌های پر واریانس؛ مصرف زیاد دیتا                |
| **Actor–critic**    | هم policy و هم value                | Actor با گرادیان آپدیت می‌شه، critic یه baseline می‌ده | مزیت‌ها رو ترکیب می‌کنه؛ مقیاس‌پذیر تو دنیای deep            | ناپایداری دوطرفه؛ ابرپارامترهای اضافه                 |


![main graph](Pictures/1.png)

پس Value-method-ها نقش *پیش‌بینی کارآمد* رو بازی می‌کنن و معمولاً خط مبنا هستن تا روش‌های شاخ‌تر خودشونو باهاش مقایسه کنن. الگوریتم‌های کلاسیک مثل **value iteration** و **policy iteration** وقتی MDP اون‌قدر کوچیکه که بشه لیستش کرد، جواب بهینه رو تضمین می‌کنن. تو محیط‌های بزرگ یا پیوسته می‌ریم سراغ **approximate dynamic programming** یا **deep Q-networks (DQN)** که به جای جدول، از تقریب‌گرهای تابع پارامتری ــ اکثراً شبکهٔ عصبی ــ استفاده می‌کنن. موفقیت‌ها (و بعضی وقتا شکست‌های عجیب) Atari DQN و نسخه‌هاش، هم قدرت و هم شکنندگی یادگیری ارزش-محور رو خوب نشون می‌ده.

## معادله‌های Bellman و Value Function‌-ها

چیزایی که تو این فصل میاد پایهٔ تحلیلی‌ایه که در عمل **همهٔ** الگوریتم‌های value-based reinforcement-learning (RL) روش سوارن. ما کل نظریه رو تو چارچوب یه **finite, time-homogeneous Markov decision process (MDP)**

$$
\mathcal M=(\mathcal S,\mathcal A,P,R,\gamma),
$$

می‌سازیم، که توش

* $\mathcal S$ یه مجموعهٔ متناهی از stateهاست،
* $\mathcal A$ یه مجموعهٔ متناهی از اکشن‌هاست،
* $P(s' \mid s,a)$ کرنل transition یه-مرحله‌ایه
  $\Pr{s_{t+1}=s'\mid s_t=s,a_t=a}$،
* $R(s,a,s')\doteq\mathbb E!\left[R_{t+1}\mid s_t=s,a_t=a,s_{t+1}=s'\right]$ ریوارد فوریِ مورد انتظاره، و
* $0\le\gamma\le1$ هم factor تنزیله.

یه **policy** (stationary, randomized) هر نگاشتیه

$$
\pi:\mathcal S\times\mathcal A\to[0,1],\qquad
\sum_{a\in\mathcal A}\pi(a\mid s)=1\ \forall s\in\mathcal S,
$$

که این‌جوری خونده می‌شه: $\pi(a\mid s)=\Pr{a_t=a\mid s_t=s}$. تو کل متن، **expectation**‌ها نسبت به توزیع مشترکی گرفته می‌شن که $\pi$ و دینامیک محیط $P$ می‌سازن. بعضی وقتا وقتی همهٔ stateها رو یه‌جا جمع می‌کنیم، بردار ضخیم به کار می‌بریم؛ مثلاً $\mathbf V^\pi\in\mathbb R^{|\mathcal S|}$ مؤلفه‌های $V^\pi(s)$ رو نگه می‌داره.

---

### State-Value Function $V^\pi$

#### تعریف

از یه state شروعی $s_t=s$ تو زمان $t$ که راه بیفتیم، **return** بی‌نهایت‌افق زیر policy $\pi$ این شکلیه:

$$
G_t = \sum_{k=0}^{\infty} \gamma^{k}\,R_{t+k+1}.
$$

**State-value function** هم می‌گه وقتی از حالا به بعد کنترل دست $\pi$ باشه، این state چقد می‌ارزه:

$$
\boxed{\,V^\pi(s)=\mathbb E_\pi\!\bigl[\,G_t\,\bigm|\,s_t=s\bigr]\,}
$$

$\gamma$ دو تا کار اصلی می‌کنه:

* **ریاضی:** اگه ریواردها کراندار باشن و $\gamma<1$، سری هندسی تضمین می‌کنه $|G_t|$ تقریباً حتماً متناهیه، پس expectation درست درمیاد.
* **عملی:** سلیقهٔ ایجنت رو دربارهٔ زود یا دیر رسیدن ریوارد نشون می‌ده؛ $\gamma$ کوچیک ایجنت رو کج‌فکر (myopic) می‌کنه، ولی وقتی $\gamma\uparrow1$ بشه، پیامدهای دوردست سوار می‌شن.

اگه $\gamma=1$ باشه باید فقط سراغ کارای episodic بریم که دنبالهٔ ریواردشون با احتمال $1$ تو زمان متناهی تموم می‌شه، وگرنه $G_t$ ممکنه بره هوا.

#### بدست آوردن معادلهٔ Bellman Expectation

خاصیت اصلی یه MDP، **Markov property** ـه: توزیع $(s_{t+1},R_{t+1})$ فقط به جفت فعلی $(s_t,a_t)$ وابسته‌ست و گذشتهٔ قبل‌تر مهم نیست. با شرط بستن روی قدم اول و استفاده از **tower property** تو expectationها:

$$
\begin{aligned}
V^\pi(s)
   &= \mathbb E_\pi \!\left[\,
       R_{t+1} + \gamma G_{t+1} \,\middle|\, s_t=s
      \right] \\
   &= \sum_{a\in\mathcal A} \pi(a\mid s)
      \sum_{s'\in\mathcal S} P(s'\mid s,a)\;
      \mathbb E\!\left[
        R_{t+1} + \gamma G_{t+1}
        \,\middle|\, s_t=s,a_t=a,s_{t+1}=s'
      \right].
\end{aligned}
$$

چون طبق تعریف بالا، $G_{t+1}$ همون return از state $s_{t+1}=s'$ ـه،

$$
\mathbb E\!\bigl[G_{t+1}\mid s_{t+1}=s'\bigr] = V^\pi(s').
$$

جای‌گذاری و عوض کردن اندیس‌ها، **معادلهٔ Bellman Expectation (فرم state)** رو می‌ده:

$$
\boxed{\,V^\pi(s) =
     \sum_{a}\pi(a\mid s)
       \sum_{s'} P(s'\mid s,a)
       \Bigl[\,R(s,a,s') + \gamma V^\pi(s')\Bigr]\,}
$$

سمت راست یا شناخته‌شده‌ست (مدل) یا خود $V^\pi$ ـه، پس این معادله می‌شه یه سیستم $|\mathcal S|$ تا معادلهٔ خطی با همون تعداد مجهول.

#### از دید جبرخطی

برای هر policy $\pi$ تعریف می‌کنیم:

$$
\bigl[P^\pi\bigr]_{ss'} =\sum_{a}\pi(a\mid s)\,P(s'\mid s,a),
\quad
\bigl[r^\pi\bigr]_s =
      \sum_{a}\pi(a\mid s)
      \sum_{s'}P(s'\mid s,a)\,R(s,a,s').
$$

اون‌وقت رابطهٔ بالا می‌شه

$$
\mathbf V^\pi = \mathbf r^\pi + \gamma P^\pi \mathbf V^\pi,
\qquad\Longrightarrow\qquad
(\mathbf I - \gamma P^\pi)\mathbf V^\pi = \mathbf r^\pi,
$$

که $\mathbf I$ ماتریس واحده. چون $P^\pi$ ردیفی-نرمالیزه‌ست و $\gamma<1$، ماتریس $\mathbf I-\gamma P^\pi$ به شکل سفت و سخت قطری غالب و در نتیجه nonsingular درمیاد؛ پس رابطهٔ بالا دقیقاً یه جواب بسته داره:

$$
\boxed{\;
  \mathbf V^\pi
  = (\mathbf I - \gamma P^\pi)^{-1}\mathbf r^\pi
  \;}
$$

این فرمول **ساختار خطی** مسئلهٔ prediction رو رو می‌کنه.

#### Contraction Mapping and Uniqueness

**عملگر Bellman** $T^\pi:\mathbb R^{|\mathcal S|}\to\mathbb R^{|\mathcal S|}$ عنصر به عنصر با همون سمت راست معادلهٔ بالا تعریف می‌شه. فضای $\mathbb R^{|\mathcal S|}$ رو با سوپ‌نرم $\|\cdot\|_\infty$ در نظر بگیر. می‌شه نشون داد:

$$
\|T^\pi\mathbf x - T^\pi\mathbf y\|_\infty
  \le \gamma\|\mathbf x - \mathbf y\|_\infty
  \qquad\forall\mathbf x,\mathbf y,
$$

یعنی $T^\pi$ یه $\gamma$-**contraction** ـه. قضیهٔ نقطه-ثابت Banach می‌گه:

* **وجود و یکتایی:** $T^\pi$ فقط یه نقطهٔ ثابت داره، همون $\mathbf V^\pi$.
* **ارزیابی تکراری:** هر جا با یه $\mathbf v_0$ شروع کنی، دنبالهٔ $\mathbf v_{k+1}=T^\pi\mathbf v_k$ با آهنگ هندسی $O(\gamma^k)$ می‌ره سمت $\mathbf V^\pi$.

این نتیجهٔ پایه پشت **iterative policy evaluation** ـه و مطمئنمون می‌کنه حتی فضاهای state خیلی بزرگ رو می‌شه با روش‌های تقریبی افزایشی هندل کرد و اصلاً لازم نیست رابطهٔ بستهٔ بالا رو وارون کنیم.

#### برداشت شهودی

معادلهٔ Bellman Expectation رو معمولاً یه **شرط خودسازگاری** می‌دونن: ارزش state $s$ برابر انتظار ریوارد فوریه به‌علاوهٔ value تنزیل‌شدهٔ جایی که با احتمال‌های مختلف بعدش می‌افتی. چون expectation زیر $\pi$ گرفته می‌شه، $V^\pi$ یه ارزیابی *subjective* حساب می‌شه—policy عوض شه، عددها هم عوض می‌شن.

### Action-Value Function $Q^\pi$

#### تعریف

در حالی که $V^\pi$ پیامدهای آینده رو تو هر state به یه مقدار عددی منفرد تقلیل میده، **action-value function** تصمیم اول رو صریح نگه می‌داره:

$$
\boxed{\,Q^\pi(s,a)
   \;=\;
   \mathbb E_\pi\!\bigl[\,G_t \mid s_t=s,\;a_t=a\bigr]\,}
$$

بعد از اینکه یه بار $a$ رو زدیم، کنترل از $t+1$ به بعد دوباره میره دست policy $\pi$. پس میشه $Q^\pi$ رو این‌طور دید: «یه گام exploration، بعدش بر اساس عادت عمل کن.»

#### معادله Expectation بلمن (Action Form)

با شرط‌بندی دقیقاً یه گام عمیق‌تر نسبت به $V^\pi$:

$$
\begin{aligned}
Q^\pi(s,a)
  &= \sum_{s'} P(s'\mid s,a)\;
     \mathbb E\!\left[
        R_{t+1} + \gamma G_{t+1}
        \,\middle|\, s_{t+1}=s'
      \right] \\
  &= \sum_{s'} P(s'\mid s,a)
        \bigl[\,R(s,a,s') + \gamma V^\pi(s')\bigr].
\end{aligned}
$$

اگه رابطهٔ بالا رو برای $V^\pi(s')$ بذاریم، نسخهٔ کامل‌شدهٔ دو-جمعی درمیاد:

$$
Q^\pi(s,a)=
\sum_{s'}P(s'\mid s,a)
\bigl[\,R(s,a,s')+\gamma\sum_{a'}\pi(a'\mid s')\,Q^\pi(s',a')\bigr].
$$

ببینید که $Q^\pi$ شامل $V^\pi$ هم هست:

$$
V^\pi(s)=
\sum_{a}\pi(a\mid s)\,Q^\pi(s,a),\qquad\forall s.
$$

معادلهٔ بالا همون پیوند جبریه که prediction و control رو به هم وصل می‌کنه.

#### فرم ماتریسی

بردار $Q^\pi$ رو فرض کنید به طول $|\mathcal S||\mathcal A|$. بذارید $P^{(s,a)}$ اون بردار سطری احتمال‌های next-state باشه، و تعریف کنید

$$
\bigl[r^{(s,a)}\bigr]_{s'}=R(s,a,s').
$$

بعد معادلهٔ قبل رو میشه این‌جوری نوشت:

$$
\mathbf Q^\pi=\mathbf r+\gamma\mathbf P\,\Pi\,\mathbf Q^\pi,
$$

که توش $\Pi$ یه ماتریس بلوک-قطریه که policy $\pi$ رو نشون میده. استدلال‌های contraction مشابه بخش قبلی نشون میدن که تکرار اپراتور بلمن روی این معادله به نقطهٔ ثابت یکتای $\mathbf Q^\pi$ همگرا میشه.

#### چرا اصلاً $Q$ رو نگه داریم؟

در اصل میشد «فقط» از $V^\pi$ تصمیم گرفت، اما عمل کردن به‌صورت greedy با توجه به $V$ یعنی هر بار باید یه expectation تو در تو روی اکشن‌ها محاسبه کنی. نگهداری $Q$ انتخاب اکشن greedy رو آسون می‌کنه:

$$
\pi_{\text{greedy}}(s)=\arg\max_{a}Q(s,a).
$$

ضمن اینکه الگوریتم‌هایی مثل Q-learning و SARSA مستقیم $Q$ رو آپدیت می‌کنن و نیاز به مدل صریح $P$ ندارن.

### Bellman Optimality Equations

توی control دنبال یه policy ثابت نیستیم؛ می‌خوایم ببینیم بیشترین مقدار ممکن چقدره.

#### Optimal State-Value Function

$$
V^*(s) \;=\; \max_\pi V^\pi(s),\qquad\forall s.
$$

با همون استدلال «شرط گذاشتن روی قدم بعد»، ولی این بار چون می‌دونیم تو $t+1$ دوباره می‌تونیم optimal عمل کنیم، می‌رسیم به

$$
\boxed{\,V^*(s) \;=\;
       \max_{a}\,\sum_{s'}P(s'\mid s,a)
       \bigl[\,R(s,a,s')+\gamma V^*(s')\bigr]\,}
$$

— **معادلهٔ Bellman Optimality (state form)**.  سمت راست همین معادله **عملگر Bellman optimality** $T^*$ رو تعریف می‌کنه. مثل $T^\pi$، $T^*$ یه $\gamma$-contraction-ه؛ پس $V^*$ تنها fixed-point ـشه و اگه value-iteration $(v_{k+1}=T^*v_k)$ رو اجرا کنیم، خودش میره تا همگرا شه.

#### Optimal Action-Value Function

$$
\boxed{\,Q^*(s,a) \;=\;
       \sum_{s'}P(s'\mid s,a)
       \Bigl[\,R(s,a,s')+\gamma \max_{a'} Q^*(s',a')\Bigr]\,}
$$

policy‌-های deterministic optimal دقیقاً همونایی هستن که هر اکشنی رو که تو اون max داخلی برده انتخاب می‌کنن. یه رابطهٔ بامزه هم با جاگذاری رابطهٔ بالا درمیاد:

$$
V^*(s)
   \;=\; \max_a Q^*(s,a),\qquad
\pi^*(s) \in \arg\max_a Q^*(s,a).
$$

پس **کافیه $Q^*$ رو پیدا کنیم تا optimal control رو داشته باشیم**.

---

### Mathematical Properties and Guarantees

* **Monotonicity:** اگه $\mathbf x$ تو هر مؤلفه از $\mathbf y$ کوچیک‌تر یا مساوی باشه، اون‌وقت $T^\pi\mathbf x$ هم از $T^\pi\mathbf y$ کم‌تر یا مساوی می‌شه، و برای $T^*$ هم همین داستانه.
* **Policy improvement theorem:** واسه هر $\pi,\pi'$، اگه $Q^\pi(s,\pi'(s))\ge V^\pi(s)$ برای همهٔ $s$ برقرار باشه و برای یه $s$ نابرابری تیز باشه، یه جایی $V^{\pi'}(s)$ $V^\pi(s)$ رو می‌گیره جلو. هی اینو تکرار کنیم می‌شه همون **policy-iteration**.
* **Convergence rate:** چون ضریب contraction همون $\gamma$ ـه، بدترین خطای حدی بعد از $k$ دور value-iteration کمتر یا مساوی $\gamma^k/(1-\gamma)$ می‌شه. وقتی $\gamma$ نزدیک ۱ باشه، ترفندهای سرعت‌بخشی مثل multigrid یا prioritized sweeping حسابی به کار میان.









## Dynamic Programming

DP چارچوب استاندارد و **model-based** برای حل Markov Decision Processهای با افق محدود و افق بی‌نهایتِ تخفیف‌دار (MDPs) ـه. توی یه MDP، ایجنت با یه محیط تصادفی که با چهارگانهٔ شناخته‌شدهٔ زیر مشخص می‌شه سر‌و‌کله می‌زنه  

$$
\mathcal{M}=\langle \mathcal{S},\mathcal{A},P,R,\gamma\rangle ,
$$

که توش  

* **$\mathcal{S}$** یه مجموعهٔ محدود از حالت‌هاس؛  
* **$\mathcal{A}$** یه مجموعهٔ محدود از اکشن‌هاس (فرض می‌کنیم هر اکشنی تو هر حالتی در دسترسه؛ اگه این‌طور نباشه می‌شه چندتا اکشنِ ساختگی اضافه کرد که حالت رو تغییر ندن)؛  
* **$P(s'|s,a)$** احتمال انتقال یه مرحله‌س که *dynamics* دقیق محیطو نشون می‌ده؛  
* **$R(s,a)$** ریوارد آنیِ مورد توقعه بعدِ اجرای اکشن $a$ تو حالت $s$ (ریواردها رو کراندار می‌گیریم، $|R|\le R_{\max}<\infty$)؛  
* **$\gamma\in[0,1)$** فاکتور تخفیفه که سودای آینده رو هندسی کم می‌کنه.  

چون $P$ و $R$ رو کامل می‌دونیم، الگوریتمای DP می‌تونن *planning* کنن: به‌جای اینکه مثل Monte-Carlo یا Temporal-Difference learning از تراژکتوری نمونه بگیرن، هی معادلات بلمن رو جایگذاری می‌کنن و دربارهٔ آینده فکر می‌کنن. هزینهٔ این دقت، محاسباتیه: جمع کامل روی $s'$ (و معمولاً یه ماکزیمم‌گیری روی $a$) تو هر قدم آپدیت، وقتی $|\mathcal{S}|$ و $|\mathcal{A}|$ بزرگ می‌شن، بدجوری سنگین می‌شه—یه جور درگیری با **curse of dimensionality**.  

جلوتر چهار جزء کلاسیک DP—Value Iteration، Policy Evaluation، Policy Improvement و Policy Iteration—رو توضیح می‌دیم و پایه‌های ریاضیشون، تضمین همگراییشون و بار محاسباتیشون رو زیر ذره‌بین می‌بریم.
















## Value Iteration

قبل از این‌که بریم سراغِ خودِ الگوریتم، یادت باشه *value iteration* برای یه **finite, discounted MDP** به شکل $(\mathcal S,\mathcal A,P,R,\gamma)$ ساخته شده که توش مثل بالا همون $\mathcal S$ و $\mathcal A$ و کلا همون ستاپ بالا رو داریم.

برای هر policy ثابت $\pi:\mathcal S\to\mathcal A$، value functionش تنها جوابِ **Bellman equation**ه:

$$
V^\pi(s)=R\bigl(s,\pi(s)\bigr)+\gamma\sum_{s'}P\!\bigl(s'\mid s,\pi(s)\bigr)\,V^\pi(s'),\qquad\forall s\in\mathcal S.
$$

هدفِ planning اینه که **optimal value function** رو پیدا کنیم:

$$
V^*(s)=\sup_\pi V^\pi(s),\qquad\forall s,
$$

و دستِ‌کم یه policy بهینه $\pi^*$ که اون supremum رو می‌گیره دربیاریم.  
value iteration مستقیم میره سراغ $V^*$، با تکرارِ یه اپراتور که کنترلِ بهینهٔ یه‌گام رو تو خودش داره.

---

### Bellman Optimality Operator

#### تعریفِ

**optimal Bellman operator** $T_*:\mathbb R^{|\mathcal S|}\to\mathbb R^{|\mathcal S|}$ به‌صورت مؤلفه‌ای این‌جوریه:

$$
(T_*V)(s)=\max_{a\in\mathcal A}\Bigl[R(s,a)+\gamma\sum_{s'\in\mathcal S}P(s'\mid s,a)\,V(s')\Bigr].
$$

به $T_*V$ مثل یه نگاهِ یه‌گامیِ «بهترینِ ممکن» به $V$ نگاه کن: تک‌تک اکشن‌ها رو با ریوارد آنی‌شون جمعِ continuation valueِ تخفیف‌خورده مقایسه می‌کنیم. اکشن *greedy* تو $s$ نسبت به $V$ هر کدوم از ماکسیمایزرهای داخل کروشه‌ست.

##### یه کم دربارهٔ نوتیشن

*بردارها و نُرم‌ها.* value function $V$ رو با بردار $(V(s))_{s\in\mathcal S}$ تو $\mathbb R^{|\mathcal S|}$ یکی می‌گیریم.  
**sup-norm** یا همون **max-norm** میشه

$$
\|V\|_\infty=\max_{s\in\mathcal S}|V(s)|.
$$

این نُرم به خاطر ماکزیممِ مؤلفه‌ای که تو $T_*$ قایم شده خیلی تمیز کار می‌کنه.

##### دو تا خاصیتِ ساختاری

1. **Monotonicity.**  
   اگه $V\le U$ (مؤلفه‌به‌مؤلفه)، اون‌وقت $T_*V\le T_*U$.

   *دلیل.* $V(s')$ رو با $U(s')$ عوض کن؛ تک‌تک جمله‌ها بزرگ‌تر میشن، پس کل کروشه بزرگ‌تره. ماکزیمم روی $a$ هم نابرابری رو نگه می‌داره. ∎

   *حسش.* وقتی continuation value-ها رو بالا ببری، ارزیابیِ «یه‌گام-بهینه» هم فقط می‌تونه بالا بره یا ثابت بمونه. این خاصیت پشتِ کلی کرانِ خطای پراپگیشنه.

2. **$\gamma$-Contraction.**  
   برای هر $V,U$،

   $$
   \|T_*V-T_*U\|_\infty\le\gamma\,\|V-U\|_\infty.
   $$

   تنها چیزی که فاصله رو کم می‌کنه همین $\gamma<1$ئه؛ نه ماکزیمم و نه امیدریاضی خودشون فاصله کم نمی‌کنن.

##### وجود و یکتایی fixed-point

چون $(\mathbb R^{|\mathcal S|},\|\cdot\|_\infty)$ کامله و $T_*$ هم contraction حسابیه، **Banach fixed-point theorem** میگه:

* یه fixed point یکتا $V^*$ با $T_*V^*=V^*$ وجود داره؛
* تکرارها $V_{k+1}=T_*V_k$ به‌صورت هندسی همگرا میشن:

  $$
  \|V_k-V^*\|_\infty\le\gamma^{\,k}\|V_0-V^*\|_\infty,\qquad k=0,1,\dots
  $$

پس value iteration اصلاً نیاز به حدس اولیهٔ خوب نداره؛ از هرجای معقولی شروع کنی می‌رسه و خطا حداقل نمایی کم میشه.

##### شهودِ بیشتر

قدرتِ *dynamic programming* تو اینه که تصمیم‌های بهینه رو به‎صورت بازگشتی «تا می‌کنی» عقب. هر بار $T_*$ رو اعمال می‌کنی، **یه گام دیگه** استدلالِ بهینه اضافه میشه. بعدِ $k$ دور، $V_k$ برابره با بازگشتِ اجرای policy بهینه برای $k$ قدم و بعدش تَکیه دادن به $V_0$ تا تهِ زمان. عامل $\gamma^k$ دقیقاً وزنِ ریواردهای دورتر رو نشون میده.

علاوه بر این، monotonicity میگه اگه $V_0$ از بالا یا پایین $V^*$ رو محدود کنه، کل مسیر همون کران رو حفظ می‌کنه. معمولاً $V_0$ رو یه حدس خوش‌بینانه یا بدبینانه می‌ذارن تا تضمین خطای یک‌طرفه داشته باشن.

---

### ساید الگوریتمی (Synchronous Sweep)

کُدِ آموزشیِ معروف یه *synchronous* sweep می‌زنه: هر حالت از مقادیر iteration $k$ برای ساختن $V_{k+1}(s)$ استفاده می‌کنه.

1. **Initialisation.**  
   این‌که $V\leftarrow0$ باشه امنه، ولی هر بردار کران‌دار جواب میده. اگه مسأله episodic باشه و حالتِ goal ارزش صفر داشته باشه، $V_0=0$ معنی‌دارترم میشه.

2. **State loop.**  
   آپدیتِ درونی

   $$
   V(s)\leftarrow\max_a\bigl[R(s,a)+\gamma\!\sum_{s'}P(s'\mid s,a)V(s')\bigr]
   $$

   دقیقاً همون $T_*$ه. برای محاسبهٔ امیدریاضی باید لیستِ successorهای $(s,a)$ رو بگردیم. وقتی dynamics sparse باشه، فرمت‌های ذخیره‌سازی فشرده مثل CSR خیلی هزینه رو کم می‌کنن.

3. **Residual tracking.**  
   $\Delta_k=\|V_{k+1}-V_k\|_\infty$ و به‌خاطر contraction داریم

   $$
   \|V_k-V^*\|_\infty\le\frac{\Delta_k}{1-\gamma}.
   $$

   یه نسخهٔ رایج اینو برعکس می‌کنه و $\varepsilon_k=(1-\gamma)\Delta_k$ می‌ذاره، وقتی $\varepsilon_k$ زیرِ حدِ دلخواه رفت، می‌ایسته.

4. **توجیهِ قانونِ توقف.**  
   اگه حلقه تو iteration $K$ با $\Delta_K<\varepsilon(1-\gamma)$ قطع بشه، اون‌وقت

   $$
   \|V_K-V^*\|_\infty\le\varepsilon,
   $$

   یعنی $V_K$ $\varepsilon$-optimalه. policy greedyی $\pi_K(s)=\arg\max_a[\dots]$ هم به همون اندازه بهینه‌ست (اثباتِ رسمی با کران‌های انحراف policy میاد).

##### درآوردنِ کرانِ residual

$$
\begin{aligned}
\|V_{K}-V^*\|_\infty
&=\|T_*V_{K-1}-T_*V^*\|_\infty\\
&\le\gamma\,\|V_{K-1}-V^*\|_\infty\\
&\le\gamma\,\bigl(\Delta_{K-1}+\|V_{K-2}-V^*\|_\infty\bigr)\\
&\le\Delta_{K-1}+\gamma^2\|V_{K-2}-V^*\|_\infty,
\end{aligned}
$$

و همین‌طور ادامه بده. جمعِ سری هندسی میشه $1/(1-\gamma)$؛ دقیقاً همون منطقیه که پشتِ stopping ruleهای temporal-difference learningه.

##### نسخهٔ Gauss–Seidel (asynchronous)

اگه حالت‌ها رو **in-place** آپدیت کنی و تو همون sweep از تازه‌ترین مقادیر استفاده کنی، اپراتور جدید

$$
\widehat T_*^{\text{GS}}V=(T_*V)(s_1),(T_*(\text{updated }V))(s_2),\dots
$$

هنوز contractionه (بدتر از $\gamma$ نیست) ولی تو عمل سریع‌تر جمع می‌کنه، چون اطلاعات تو همون sweep پخش میشه. prioritised sweeping اول میره سراغ حالت‌های «خیلی کهنه»، و روی مسائل sparse می‌تونه فوق‌العاده زود جواب بده.

---

### تحلیل پیچیدگی

##### هزینهٔ محاسبهٔ هر iteration

برای هر حالت، هر اکشن رو یه بار می‌سنجیم و برای $(s,a)$ همهٔ successorها رو چک می‌کنیم. بذار

* $\bar n=\frac{1}{|\mathcal S||\mathcal A|}\sum_{s,a}|\{s':P(s'|s,a)>0\}|$.

اون‌وقت تعداد عملیات float تو هر sweep میشه $O(|\mathcal S||\mathcal A|\bar n)$. تو MDPهای deterministic $\bar n=1$ئه؛ ولی تو dynamics factored، $\bar n$ ممکنه نمایی زیاد شه مگر وابستگی‌های sparse رو استفاده کنیم.

##### تعداد iteration لازم

از کرانِ contraction داریم

$$
\|V_k-V^*\|_\infty\le\gamma^{\,k}\|V_0-V^*\|_\infty,
$$

پس برای دقت $\varepsilon$ لازمه

$$
k\ge\frac{\log(\|V_0-V^*\|_\infty/\varepsilon)}{\log(1/\gamma)}
       =O\!\bigl(\tfrac{1}{1-\gamma}\log\tfrac{1}{\varepsilon}\bigr).
$$

تو کارهای **long-horizon** که $\gamma$ خیلی نزدیک به ۱ (مثلاً 0.999) میشه، $(1-\gamma)^{-1}$ راحت می‌رسه به چند هزار، و sweepهای کامل گرون درمیاد.













### Policy Evaluation

فرض کن یه policy قطعیِ ثابت $\,\pi:\mathcal{S}\!\to\!\mathcal{A}\,$ داشته باشیم؛ اون وقت **value function**

$$
V^\pi(s)=\mathbb{E}\!\Big[\sum_{t=0}^\infty\gamma^t R(S_t,\pi(S_t))\;\Big|\;S_0=s\Big]
$$

رو داریم که باید معادلهٔ **Bellman Expectation** رو برآورده کنه:

$$
V^\pi=T_\pi V^\pi,\qquad(T_\pi V)(s)=R(s,\pi(s))+\gamma\sum_{s'}P(s'|s,\pi(s))V(s').
$$

اگه $P_\pi$ رو به‌عنوان ماتریس transition $|\mathcal{S}|\!\times\!|\mathcal{S}|$ این policy و $R_\pi$ رو به‌عنوان وکتور ریوارد $|\mathcal{S}|$ بذاریم، اون وقت

$$
V^\pi=(I-\gamma P_\pi)^{-1}R_\pi.\tag{2.1}
$$

معادلهٔ (2.1) عملاً یه سیستم خطی sparseه. تو MDPهای کوچیک می‌تونیم دقیقاً با حذف گاوسی (هزینهٔ $O(|\mathcal{S}|^3)$ واسه ماتریس‌های dense) حلش کنیم، ولی معمولاً می‌ریم سراغ **Iterative Policy Evaluation**:

$$
V_{k+1}=T_\pi V_k\qquad(k=0,1,\dots).
$$

عملگر $T_\pi$ یه $\gamma$-contractionه، پس $V_k$ به‌صورت هندسی می‌ره سمت $V^\pi$. روش‌های Gauss-Seidel و Successive Over-Relaxation هم با استفاده از مقادیر تازهٔ state تو همون sweep، سرعت عملی رو بهتر می‌کنن.

**معیار توقف.** مثل Value Iteration، وقتی $\|V_{k+1}-V_k\|_\infty<\varepsilon$ شد، می‌ایستیم؛ اون موقع $V_k$ به‌اندازهٔ $\varepsilon(1-\gamma)^{-1}$ به $V^\pi$ نزدیکه. یه تست جایگزین residual مستقیم هم داریم که $\|T_\pi V_k-V_k\|_\infty$ رو نگاه می‌کنه—اگه خطای Bellman حداکثر $\varepsilon$ باشه، $V_k$ همون $\varepsilon(1-\gamma)^{-1}$ از $V^\pi$ فاصله داره.

---

### Policy Improvement

برای هر $V^\pi$، **state-action value** (همون “$Q$-value”) رو این‌جوری تعریف می‌کنیم:

$$
Q^\pi(s,a)=R(s,a)+\gamma\sum_{s'}P(s'|s,a)V^\pi(s').
$$

طبق **قضیهٔ Policy Improvement**، policy *greedy*

$$
\pi'(s)=\arg\max_{a\in\mathcal{A}}Q^\pi(s,a)
$$

یا بهتر از $\pi$ عمل می‌کنه یا مساوی:

$$
V^{\pi'}(s)\ge V^\pi(s)\quad\forall s\in\mathcal{S}.
$$

**اثبات.** از یه state دلخواه $s$ شروع کن:

$$
V^\pi(s)=R(s,\pi(s))+\gamma\sum_{s'}P(s'|s,\pi(s))V^\pi(s')\le\max_a\Big[R(s,a)+\gamma\sum_{s'}P(s'|s,a)V^\pi(s')\Big]=Q^\pi\big(s,\pi'(s)\big).
$$

حالا فرض کن اولین اکشن رو با $\pi'$ می‌زنیم و بعدش برمی‌گردیم رو $\pi$. با یه استدلال تلسکوپی نشون می‌دیم سود حاصله حداقل $V^\pi(s)$ه. چون $\pi'$ تو هر state بعدی هم به‌شکل greedy بهتر می‌شه، این نابرابری به همهٔ گام‌های زمانی سرایت می‌کنه و $V^{\pi'}\ge V^\pi$ درمیاد. ∎

یه نتیجهٔ دم‌دستی اینه که بهبودهای پیاپی **یه‌طرفه** هستن: اگه $\pi_{k+1}$ رو با greedyشدن روی $V^{\pi_k}$ بسازیم، اون‌وقت

$$
V^{\pi_{k+1}}\ge V^{\pi_k}\quad\text{component-wise}.
$$

دلیل‌های تک‌گام، دوگام یا horizon کامل همگی نمونه‌های خاص همین حکم کلی‌اند.

---

### Policy Iteration

تو Policy Iteration (PI) دو مرحلهٔ بالایی رو هی پشت سر هم اجرا می‌کنیم:

1. **Policy Evaluation** $V^{\pi_k}$ ← حل یا تقریب تکراری $(I-\gamma P_{\pi_k})V=R_{\pi_k}$.  
2. **Policy Improvement** $\pi_{k+1}(s)$ ← $\arg\max_a Q^{\pi_k}(s,a)$.

چون $V^{\pi_{k+1}}\ge V^{\pi_k}$ و تعداد policyهای قطعی $(|\mathcal{A}|^{|\mathcal{S}|})$ محدوده، دنبالهٔ $\{\pi_k\}$ بالاخره می‌رسه به یه $\pi_*$ که دیگه greedy شدن تغییرش نمی‌ده. این یعنی معادلهٔ Bellman optimality برقرار شده:

$$
V^{\pi_*}=T_*V^{\pi_*},
$$

پس $\pi_*$ بهینه‌ست و $V^{\pi_*}=V^*$. بنابراین همگرایی **تمام می‌شه** (بدترین حالت $|\mathcal{A}|^{|\mathcal{S}|}$ تکرار، ولی معمولاً خیلی خیلی زودتر).

#### Partial / Truncated Policy Evaluation

ارزیابی دقیق مرحلهٔ ۱ گرونه. بذار **$\ell$** تعداد sweepهای ارزیابی قبل از بهبود باشه. $\ell=\infty$ → همون Howard PI؛ $\ell=1$ → **Modified Policy Iteration** (MPI)؛ $\ell\to0$ و یه Bellman backup به‌ازای هر state → عملاً Value Iteration. این یعنی PI و VI دو سر یه طیفن که عمق ارزیابی بین بهبودها تعیینش می‌کنه؛ واسه همینه که fixed-point جفتشون یکیه ولی سرعت عملیشون فرق داره.

#### Complexity

* **Evaluation (دقیق):** $O(|\mathcal{S}|^3)$ واسه ماتریس dense، ولی $O(|\mathcal{S}|^2)$ یا حتی $O(|\mathcal{S}|)$ اگه ماتریس sparse یا factored باشه.  
* **Improvement:** $O(|\mathcal{S}|,|\mathcal{A}|,\bar{n})$.  
* **کل تکرارها:** معمولاً $\ll|\mathcal{S}|$؛ تو خیلی از بنچ‌مارک‌ها PI تو کمتر از ده outer-iteration جمع می‌شه.

---

### یه مقایسه نهایی: Policy Iteration vs Value Iteration

| معیار                | **Policy Iteration (PI)**                                                                                                      | **Value Iteration (VI)**                                                                               |
|----------------------|--------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| **الگوی آپدیت**      | اول *Evaluate* $V^{\pi_k}$ تا تقریباً دقیق، بعد *greedy* می‌شیم و $\pi_{k+1}$ رو می‌سازیم.                                       | یه آپدیت تک-گام contraction: $V_{k+1}=T_*V_k$.                                         |
| **Outer iterations**   | خیلی کم (تو بدترین حالت لگاریتمی نسبت به $1/(1-\gamma)$).                                                                       | ممکنه زیاد باشه (کاهش هندسی $\gamma$).                                                                |
| **حافظهٔ لازم**      | $O(|\mathcal{S}|)$ واسه $V$ و $O(|\mathcal{S}|)$ واسه $\pi$؛ اگه حلگر مستقیمه، ذخیرهٔ فاکتورسازی هم لازم می‌شه.                 | همون مرتبه، و عملاً چیزی اضافه نداره جز $V$.                                                          |
| **کاربرد ایده‌آل**    | state-space کوچیک تا متوسط یا ماتریس‌های ساختاریافته که می‌شه سریع حل کرد.                                                      | state-space بزرگ یا استریمینگ که حل خطی گرون در میاد.                                                 |

**ایدهٔ اصلی**  
PI وقت و انرژی زیادی می‌ذاره تا value-های دقیق دربیاره و یه‌هو policy رو جهش بده، ولی VI آپدیت‌های ارزون (و یکم نویزی) انجام می‌ده و آروم‌آروم می‌ره سمت بهینگی. اگه وارون کردن ماتریس (یا چند تا sweep) سریع باشه—چون $|\mathcal{S}|$ کوچیکه، ماتریس sparseه یا حلگر مخصوص داریم—PI بهتر جواب می‌ده؛ ولی تو مسائل خیلی بزرگ، هزینهٔ ارزیابی PI سنگین می‌شه و VI یا PI کوتاه‌شده بهتره.


---

### محدودیت‌های Dynamic Programming

با اینکه DP تو مدل‌های کامل جواب دقیق می‌ده، سه مشکل اساسی باعث می‌شه نتونیم مستقیم سراغ مسائل بزرگ یا پیوسته بریم:

1. **انفجار state**: حافظه و زمان حداقل خطی و معمولاً درجهٔ دو با $|\mathcal{S}|$ رشد می‌کنن. پس باید از نمایش factored، تجمیع یا function approximation کمک بگیریم.  
2. **نداشتن مدل**: ایجنت‌های واقعی معمولاً $P$ و $R$ رو دقیق نمی‌دونن. RL مدل-آزاد (مثل Q-learning) با نمونه‌برداری این فرض رو دور می‌زنه.  
3. **حساسیت به $\gamma$**: وقتی $\gamma$ نزدیک ۱ باشه، هم contraction VI کند می‌شه هم سیستم خطی PI سخت؛ پس همگرایی کند و خطای عددی زیاد می‌شه.

این چالش‌ها باعث شده روش‌هایی مثل approximate-DP، MCTS و هیبریدهای plan-learn مطرح بشن که تو فصل‌های بعد می‌گیم.

