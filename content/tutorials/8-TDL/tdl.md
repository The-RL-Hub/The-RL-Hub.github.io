# Temporal-Difference Learning


## Introduction

تو فصل قبلی یاد گرفتیم که **Monte Carlo methods** چطوری می‌تونن value functionها رو مستقیماً از experience تخمین بزنن. ایده خیلی ساده و تمیز بود: یه episode رو اجرا کن، تا آخرش صبر کن، return رو حساب کن، و از اون return به‌عنوان training target استفاده کن. اگه یه state تو episodeهای زیادی چند بار دیده بشه، همه returnهایی رو که بعد از اون state اومدن average می‌گیریم. با episodeهای کافی، این average کم‌کم تبدیل می‌شه به یه تخمین خوب از true value.

ایده قشنگیه، ولی یه محدودیت آزاردهنده داره: **Monte Carlo باید صبر کنه**.

اگه یه episode کوتاه باشه، صبر کردن خیلی مسئله خاصی نیست. ولی اگه episode طولانی باشه، یا اگه task به‌طور طبیعی تموم نشه، Monte Carlo learning کند و بدقلق می‌شه. تصور کن یه ایجنت داره ماشین رانندگی می‌کنه، inventory رو مدیریت می‌کنه، یه ربات رو کنترل می‌کنه، یا یه game بازی می‌کنه که هزاران step طول می‌کشه. اگه ایجنت فقط بعد از تموم شدن کل episode یاد بگیره، مقدار زیادی information مفید برای مدت زیادی بی‌استفاده می‌مونه.

قبل از Monte Carlo، درباره **Dynamic Programming (DP)** هم خوندیم. DP منتظر تموم شدن episodeها نمی‌مونه. valueها رو مستقیماً با Bellman equations آپدیت می‌کنه. ولی DP هم یه شرط خیلی جدی داره: یه model کامل از environment می‌خواد. باید transition probabilityها و expected rewardها رو بدونه. تو مسائل واقعی reinforcement learning، معمولاً همچین modelای نداریم.

پس دو تا حالت extreme داریم:

| Method | به model نیاز داره؟ | تا آخر episode صبر می‌کنه؟ | از bootstrapping استفاده می‌کنه؟ |
|---|---:|---:|---:|
| Dynamic Programming | بله | نه | بله |
| Monte Carlo | نه | بله | نه |
| Temporal-Difference Learning | نه | نه | بله |


![Comparison of Dynamic Programming, Monte Carlo, and Temporal-Difference learning](Pictures/1.png)

**Temporal-Difference learning**، یا **TD learning**، دقیقاً وسط این دو تا قرار می‌گیره. TD مثل Monte Carlo از experience واقعی یاد می‌گیره، پس model لازم نداره. ولی مثل Dynamic Programming بعد از هر step آپدیت می‌کنه، پس لازم نیست تا آخر episode صبر کنه.

این یه جمله، قلب TDـه:

> TD learning از experience یاد می‌گیره، یه step در هر لحظه، با آپدیت کردن یه value estimate به سمت یه value estimate دیگه.

این اولین value-based methodـه که توش RL agent واقعاً حس زنده بودن پیدا می‌کنه. با environment تعامل می‌کنه، یه ریوارد و state بعدی رو می‌بینه، و همون لحظه value estimate خودش رو بهتر می‌کنه. نه transition model کامل لازم داره. نه episode کامل لازم داره. فقط یه transition:

$$
S_t, A_t, R_{t+1}, S_{t+1}.
$$

تو این فصل، بیشتر روی **TD prediction** تمرکز می‌کنیم: یعنی تخمین زدن value function برای یه policy ثابت. این تمیزترین نقطه برای فهمیدن ایده اصلیه. آخر فصل هم خیلی کوتاه preview می‌کنیم که همین ایده چطوری تبدیل می‌شه به TD control methods مثل SARSA و Q-learning، که موضوع فصل بعدی هستن.

---

## The Prediction Problem Again

بیایید از همون prediction problem شروع کنیم که تو Monte Carlo داشتیم.

فرض کن یه ایجنت از یه policy ثابت $\pi$ پیروی می‌کنه. فعلاً نمی‌خوایم policy رو بهتر کنیم. فقط می‌خوایم جواب این سؤال رو بدونیم:

> اگه ایجنت تو state $s$ باشه و از این به بعد policy $\pi$ رو دنبال کنه، باید انتظار داشته باشه چقدر ریوارد جمع کنه؟

جواب این سؤال همون **state-value function**ـه:

$$
V^\pi(s) = \mathbb{E}_\pi[G_t \mid S_t=s].
$$

Return یعنی discounted sum ریواردهای آینده:

$$
G_t = R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} + \cdots.
$$

برای episodic tasks، این sum معمولاً تو terminal state تموم می‌شه:

$$
G_t = \sum_{k=0}^{T-t-1} \gamma^k R_{t+k+1}.
$$

برای continuing tasks، جایی که ممکنه terminal state نداشته باشیم، discount factor یعنی $\gamma<1$ باعث می‌شه return محدود بمونه، به شرطی که rewardها bounded باشن.

Monte Carlo مقدار $V^\pi(s)$ رو با sample کردن complete returnها تخمین می‌زنه. اگه state $s$ رو visit کنیم، تا آخر episode صبر کنیم، $G_t$ رو حساب کنیم، و بعد آپدیت کنیم:

$$
V(S_t) \leftarrow V(S_t) + \alpha [G_t - V(S_t)].
$$

اینجا target همون full return یعنی $G_t$ـه. این یه target واقعی و مشاهده‌شده‌ست، نه یه حدس. این strength اصلی Monte Carloـه.

ولی ضعفش هم واضحه: $G_t$ فقط بعداً معلوم می‌شه.

TD می‌پرسه: می‌تونیم قبل از اینکه full return رو بدونیم آپدیت کنیم؟

جواب بله‌ست، چون return یه ساختار recursive داره.

---

## The Key Observation: Returns Are Recursive

به return نگاه کن:

$$
G_t = R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} + \cdots.
$$

حالا همه‌چیز بعد از اولین ریوارد رو با هم گروه‌بندی کن:

$$
G_t = R_{t+1} + \gamma (R_{t+2} + \gamma R_{t+3} + \gamma^2 R_{t+4} + \cdots).
$$

ولی expression داخل پرانتز دقیقاً return از time step بعدیه:

$$
G_{t+1} = R_{t+2} + \gamma R_{t+3} + \gamma^2 R_{t+4} + \cdots.
$$

پس داریم:

$$
G_t = R_{t+1} + \gamma G_{t+1}.
$$

اگه expectation رو تحت policy $\pi$ بگیریم، می‌رسیم به ایده Bellman expectation:

$$
V^\pi(S_t) = \mathbb{E}_\pi[R_{t+1} + \gamma V^\pi(S_{t+1}) \mid S_t].
$$

این identity راه ورود به TD learningـه.

اگه true value یعنی $V^\pi(S_{t+1})$ رو می‌دونستیم، اون‌وقت بعد از دیدن فقط یه transition می‌تونستیم از

$$
R_{t+1} + \gamma V^\pi(S_{t+1})
$$

به‌عنوان یه one-step sample target برای $V^\pi(S_t)$ استفاده کنیم.

البته true value رو نمی‌دونیم. ولی current estimate خودمون یعنی $V(S_{t+1})$ رو داریم. TD می‌گه: از همون استفاده کن.

پس basic TD target می‌شه:

$$
\text{TD target} = R_{t+1} + \gamma V(S_{t+1}).
$$

این ساده‌ترین و مهم‌ترین formula این فصله.

---

## Bootstrapping

اینکه از $V(S_{t+1})$ داخل target استفاده می‌کنیم یعنی method داره از estimate خودش کمک می‌گیره تا یه estimate دیگه رو بهتر کنه. به این کار می‌گن **bootstrapping**.

Bootstrapping اولش ممکنه یه‌کم مشکوک به نظر بیاد. داریم یه حدس رو با یه حدس دیگه آپدیت می‌کنیم. خب چرا باید جواب بده؟

دلیلش اینه که این حدس‌ها با Bellman equation به هم وصلن. اگه value estimateها تقریباً درست باشن، اون‌وقت one-step target یعنی

$$
R_{t+1} + \gamma V(S_{t+1})
$$

یه تخمین مفید از return مربوط به $S_t$ می‌شه. اگه estimateها هنوز درست نباشن، updateهای تکراری کم‌کم اون‌ها رو به سمت self-consistency هل می‌دن. بعد از transitionهای زیاد، valueها آروم‌آروم با reward structure و transition dynamics محیط جور درمی‌آن.

یه analogy خوب، یاد گرفتن قیمت itemهای به‌هم‌وصل‌شده‌ست. فرض کن exact value یه خونه رو نمی‌دونی، ولی می‌دونی این خونه فقط یه خیابون با یه خونه دیگه فاصله داره که price estimate اون رو از قبل قبول داری. می‌تونی از estimate دومی استفاده کنی تا estimate اولی رو بهتر کنی. کامل و بی‌نقص نیست، ولی اگه همین‌طور information محلی بیشتری جمع کنی، کل map قیمت‌ها می‌تونه accurate بشه.

TD هم همین کار رو با stateها می‌کنه. information رو تو state space پخش می‌کنه، یه transition در هر لحظه.

---

## The TD Error

تفاوت بین TD target و current estimate رو **TD error** می‌گن:

$$
\delta_t = R_{t+1} + \gamma V(S_{t+1}) - V(S_t).
$$

این عدد بهمون می‌گه این transition، با توجه به value estimateهای فعلی ما، چقدر surprise داشته.

اگه $\delta_t>0$، transition بهتر از چیزی بوده که انتظار داشتیم. یعنی reward به‌علاوه next-state value از current estimate ما برای $S_t$ بزرگ‌تر بوده. پس باید $V(S_t)$ رو زیاد کنیم.

اگه $\delta_t<0$، transition بدتر از چیزی بوده که انتظار داشتیم. پس باید $V(S_t)$ رو کم کنیم.

اگه $\delta_t=0$، estimate با این transition به شکل locally consistent جور درمی‌آد. آپدیت لازم نیست.

آپدیت TD(0) اینه:

$$
V(S_t) \leftarrow V(S_t) + \alpha \delta_t.
$$

بازش کنیم، می‌شه:

$$
V(S_t) \leftarrow V(S_t) + \alpha [R_{t+1} + \gamma V(S_{t+1}) - V(S_t)].
$$

یا به شکل equivalent:

$$
V(S_t) \leftarrow (1-\alpha)V(S_t) + \alpha [R_{t+1} + \gamma V(S_{t+1})].
$$

این فرم آخر intuition مربوط به averaging رو نشون می‌ده. value جدید یه مقدار از old estimate به سمت TD target حرکت داده می‌شه.

پارامتر $\alpha$ همون **learning rate** یا **step size**ـه. اگه $\alpha$ کوچیک باشه، learning کندتره ولی stableتره. اگه $\alpha$ بزرگ باشه، learning سریع‌تره ولی noisyتر می‌شه و ممکنه overshoot کنه.







## TD(0): الگوریتم پایه

ساده‌ترین روش TD به اسم **TD(0)** شناخته می‌شه. این «0» یعنی این نسخه، همون نسخه‌ی one-step هست و eligibility trace نداره. تو فصل‌های بعد می‌شه این ایده رو به TD($\lambda$) گسترش داد؛ جایی که errorها به شکل backward بین چند state قبلی پخش می‌شن.

فعلا TD(0) برای ما کافیه.

### Tabular TD(0) برای Policy Evaluation

فرض کن یه مجموعه‌ی محدود از stateها داریم و برای هر state یه عدد $V(s)$ نگه می‌داریم.

الگوریتم این شکلیه:

```text
Initialize V(s) arbitrarily for all states s
Set V(terminal) = 0, if terminal states exist

Repeat for many episodes:
    Start in an initial state S
    While S is not terminal:
        Choose action A according to policy π(.|S)
        Take action A
        Observe reward R and next state S'
        V(S) ← V(S) + α [R + γ V(S') - V(S)]
        S ← S'
```

اینجا سه تا نکته‌ی مهم هست که باید بهشون دقت کنی.

اول اینکه update **داخل** episode انجام می‌شه، یعنی بعد از هر transition. لازم نیست صبر کنیم episode تموم بشه.

دوم اینکه update فقط از یه ریوارد واقعی، یعنی $R_{t+1}$، و یه future value تخمینی، یعنی $V(S_{t+1})$، استفاده می‌کنه.

سوم اینکه اگه $S_{t+1}$ یه terminal state باشه، تعریف می‌کنیم:

$$
V(S_{t+1}) = 0.
$$

پس برای transitionای که وارد terminal state می‌شه، TD target فقط می‌شه:

$$
R_{t+1}.
$$

این هم کاملا منطقیه: وقتی episode تموم شده، دیگه future valueای باقی نمونده.

---

## یه مثال عددی خیلی کوچیک

فرض کن ایجنت از این sequence رد می‌شه:

$$
A \rightarrow B \rightarrow \text{terminal}
$$

ریواردها اینان:

- از $A$ به $B$: $0$
- از $B$ به terminal: $1$

بذار $\gamma = 1$ و $\alpha = 0.5$. مقداردهی اولیه هم اینه:

$$
V(A)=0, \qquad V(B)=0.
$$

#### Episode اول

ایجنت از $A$ شروع می‌کنه.

Transition 1:

$$
A \rightarrow B, \qquad R=0.
$$

TD target:

$$
0 + 1 \cdot V(B) = 0.
$$

TD error:

$$
0 - V(A) = 0.
$$

پس $V(A)$ همون 0 می‌مونه.

Transition 2:

$$
B \rightarrow terminal, \qquad R=1.
$$

TD target:

$$
1 + 1 \cdot V(terminal) = 1.
$$

TD error:

$$
1 - V(B) = 1.
$$

Update:

$$
V(B) \leftarrow 0 + 0.5(1) = 0.5.
$$

بعد از episode اول:

$$
V(A)=0, \qquad V(B)=0.5.
$$

به یه نکته‌ی ظریف دقت کن: Monte Carlo هر دو state یعنی $A$ و $B$ رو با استفاده از return نهایی 1 update می‌کرد. اما TD(0)، تو episode اول، فقط $B$ رو update می‌کنه. اطلاعات مربوط به ریوارد terminal هنوز به $A$ برنگشته و propagate نشده.

#### Episode دوم

دوباره داریم:

$$
A \rightarrow B \rightarrow terminal.
$$

Transition 1:

$$
A \rightarrow B, \qquad R=0.
$$

حالا $V(B)=0.5$، پس TD target برای $A$ اینه:

$$
0 + V(B)=0.5.
$$

Update:

$$
V(A) \leftarrow 0 + 0.5(0.5 - 0)=0.25.
$$

Transition 2:

$$
B \rightarrow terminal, \qquad R=1.
$$

Update:

$$
V(B) \leftarrow 0.5 + 0.5(1-0.5)=0.75.
$$

بعد از episode دوم:

$$
V(A)=0.25, \qquad V(B)=0.75.
$$

حالا ریوارد کم‌کم شروع کرده از terminal state به عقب propagate شدن؛ اول به $B$ رسیده و بعد از $B$ به $A$.

داستان اصلی TD همینه: اطلاعات ریوارد از طریق value estimateها، هر بار یه transition، به عقب حرکت می‌کنه.
