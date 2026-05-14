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


![Recursive structure of the return and the TD target](Pictures/2.png)


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










## TD در مقابل Monte Carlo

Monte Carlo و TD هر دو از experience یاد می‌گیرن، اما targetهایی که استفاده می‌کنن با هم فرق داره.

update در Monte Carlo:

$$
V(S_t) \leftarrow V(S_t) + \alpha [G_t - V(S_t)].
$$

update در TD:

$$
V(S_t) \leftarrow V(S_t) + \alpha [R_{t+1} + \gamma V(S_{t+1}) - V(S_t)].
$$

فرق اصلی توی target است:

| Method | Target | کی می‌تونه update کنه؟ |
|---|---|---|
| Monte Carlo | $G_t$ | بعد از اینکه episode تموم شد |
| TD(0) | $R_{t+1}+\gamma V(S_{t+1})$ | بعد از یه step |

Monte Carlo از یه sampled return واقعی استفاده می‌کنه. TD از یه bootstrapped estimate از return استفاده می‌کنه.

#### مزیت‌های TD نسبت به Monte Carlo

**1. TD می‌تونه قبل از تموم شدن episode یاد بگیره.**

این توی episodeهای طولانی خیلی مهمه. TD بلافاصله بعد از هر transition update می‌کنه.

**2. TD به‌صورت طبیعی توی continuing taskها قابل استفاده‌ست.**

Monte Carlo به episode نیاز داره، یا حداقل به یه truncation مصنوعی. TD فقط transition می‌خواد، پس توی taskهای ongoing خیلی راحت و تمیز کار می‌کنه.

**3. TD معمولاً variance پایین‌تری داره.**

یه full return می‌تونه خیلی نوسان داشته باشه، چون شامل همه randomness آینده‌ست. TD targetها فقط از یه ریوارد به‌علاوه‌ی یه estimated next value استفاده می‌کنن، برای همین معمولاً noise کمتری دارن.

**4. TD می‌تونه از incomplete experience هم یاد بگیره.**

اگر یه episode وسط کار قطع بشه، TD باز هم از همه transitionهایی که تا اون لحظه دیده یاد گرفته. اما Monte Carlo ممکنه کل اون partial episode رو از دست بده، مگر اینکه handling خاصی براش اضافه کنیم.

#### مزیت‌های Monte Carlo نسبت به TD

**1. Monte Carlo targetها bootstrapped نیستن.**

target یعنی $G_t$ بر اساس ریواردهای واقعی ساخته می‌شه، نه بر اساس current value estimate. پس MC دنبال predictionهای احتمالاً اشتباه خودش نمی‌دوه.

**2. Monte Carlo از نظر مفهومی خیلی ساده‌ست.**

episodeها رو اجرا کن. returnها رو average بگیر. کل ایده همینه.

**3. Monte Carlo وقتی episodeها کوتاهن و sample گرفتن ازشون راحته، می‌تونه خیلی effective باشه.**

برای gameها یا simulation taskهایی که پایان episode توشون مشخصه، MC معمولاً یه baseline قوی محسوب می‌شه.


## TD در مقابل Dynamic Programming

TD از یه جهت خیلی شبیه Dynamic Programming به نظر میاد.

Bellman expectation backup در DP اینه:

$$
V(s) \leftarrow \sum_a \pi(a|s) \sum_{s'} P(s'|s,a) [R(s,a,s') + \gamma V(s')].
$$

این یه **expected backup** است. یعنی با استفاده از model، روی همه اکشن‌های ممکن و همه next stateهای ممکن average می‌گیره.

TD از یه sampled transition استفاده می‌کنه:

$$
V(S_t) \leftarrow V(S_t) + \alpha [R_{t+1} + \gamma V(S_{t+1}) - V(S_t)].
$$

این یه **sample backup** است. به‌جای اینکه روی همه next stateهای ممکن sum بگیریم، TD صبر می‌کنه تا environment یه next state واقعی تولید کنه و بعد از همون sample برای update استفاده می‌کنه.

پس TD شبیه sample-based Dynamic Programming است.

| Method | Backup type | منبع next stateها |
|---|---|---|
| DP | expected backup | model probabilities |
| TD | sample backup | real experience |

برای همینه که TD توی RL این‌قدر central است. TD ایده‌ی Bellman bootstrapping رو از DP نگه می‌داره، اما این requirement رو که model رو بشناسیم حذف می‌کنه.









## شهود Backup Diagram

دیدن backupها به شکل تصویری خیلی کمک می‌کنه.

برای Monte Carlo، یه state با استفاده از کل trajectory آینده update می‌شه:

```text
S_t → R_{t+1} → S_{t+1} → R_{t+2} → S_{t+2} → ... → terminal
```

target همون full return هست:

$$
G_t.
$$

برای TD(0)، یه state فقط با استفاده از reward بعدی و value بعدی update می‌شه:

```text
S_t → R_{t+1} → S_{t+1}
```

target اینه:

$$
R_{t+1}+\gamma V(S_{t+1}).
$$

TD(0) فقط یه step جلوتر رو نگاه می‌کنه. Monte Carlo تا آخر مسیر رو نگاه می‌کنه.

بعداً، n-step methodها فضای بین این دو رو پر می‌کنن:

$$
G_t^{(n)} = R_{t+1} + \gamma R_{t+2} + \cdots + \gamma^{n-1}R_{t+n} + \gamma^n V(S_{t+n}).
$$

- اگه $n=1$ باشه، این همون TD(0) می‌شه.
- اگه $n$ تا آخر episode ادامه پیدا کنه، این تبدیل می‌شه به Monte Carlo.

پس TD و MC دو دنیای کاملاً جدا از هم نیستن. این‌ها دو سر یه خانواده بزرگ‌تر از return-based methodها هستن.

---

## یه مثال کلاسیک: Random Walk

یه مثال استاندارد برای فهم TD prediction، یه random walk کوچیکه.

فرض کن پنج تا state غیر-terminal داریم:

$$
A, B, C, D, E
$$

یه terminal state سمت چپ داریم و یه terminal state سمت راست:

```text
terminal چپ — A — B — C — D — E — terminal راست
```

ایجنت از state وسط، یعنی $C$، شروع می‌کنه. تو هر step، با احتمال برابر یا به چپ می‌ره یا به راست.

ریواردها:

- رسیدن به terminal چپ ریوارد $0$ می‌ده
- رسیدن به terminal راست ریوارد $1$ می‌ده
- همه transitionهای دیگه ریوارد $0$ می‌دن

فرض کن $\gamma=1$.

valueهای واقعی، همون احتمال‌های در نهایت رسیدن به terminal راست از هر state هستن. چون random walk متقارنه:

$$
V^*(A)=\frac{1}{6}, \quad
V^*(B)=\frac{2}{6}, \quad
V^*(C)=\frac{3}{6}, \quad
V^*(D)=\frac{4}{6}, \quad
V^*(E)=\frac{5}{6}.
$$

حالا فرض کن همه stateهای غیر-terminal رو با $0.5$ initialize می‌کنیم:

$$
V(A)=V(B)=V(C)=V(D)=V(E)=0.5.
$$

چرا $0.5$؟ چون قبل از دیدن data، ممکنه حدس بزنیم هر state یه شانس پنجاه-پنجاه داره که آخرش به سمت راست ختم بشه.

#### Monte Carlo چی کار می‌کنه

Monte Carlo صبر می‌کنه تا یه episode تموم بشه. اگه episode به terminal راست برسه، return برای همه stateهای بازدیدشده 1 می‌شه. اگه به terminal چپ برسه، return برابر 0 می‌شه.

پس هر stateای که تو episode دیده شده، به سمت outcome نهایی هل داده می‌شه.

این می‌تونه noisy باشه. مثلاً state $A$ نزدیک terminal چپه، پس value واقعی‌اش پایینه. ولی هنوز ممکنه یه episode که از $A$ رد شده، آخرش همه راه رو به سمت راست بره و ریوارد 1 بگیره. اون‌وقت Monte Carlo مقدار $V(A)$ رو بر اساس اون outcome کامل به سمت بالا هل می‌ده.

#### TD چی کار می‌کنه

TD هر بار یه step update می‌کنه. اگه ایجنت با ریوارد 0 از $A$ به $B$ حرکت کنه، TD این update رو انجام می‌ده:

$$
V(A) \leftarrow V(A) + \alpha [0 + V(B) - V(A)].
$$

پس $A$ به سمت value مربوط به $B$ هل داده می‌شه.

اگه ایجنت از $A$ به terminal چپ بره، TD این update رو انجام می‌ده:

$$
V(A) \leftarrow V(A) + \alpha [0 - V(A)].
$$

پس $A$ به سمت پایین هل داده می‌شه.

بعد از episodeهای زیاد، valueها کم‌کم خودشون رو به شکل یه gradient نرم از چپ به راست مرتب می‌کنن. TD اطلاعات ریوارد رو به صورت local و از طریق stateهای همسایه پخش می‌کنه.

این مثال نشون می‌ده چرا TD می‌تونه efficient یاد بگیره. لازم نیست برای هر state منتظر کلی return کامل بمونه. TD از ساختار transitionها استفاده می‌کنه تا value information رو propagate کنه.

---

## چرا TD می‌تونه از Predictionها یاد بگیره

یکی از جالب‌ترین بخش‌های TD اینه که از تغییرات predictionها یاد می‌گیره.

فرض کن دیروز predictionت این بود که تیمت 40% شانس بردن یه tournament رو داره. امروز بهترین بازیکنشون از injury برگشته، و حالا predictionت شده 60%. خود tournament هنوز برگزار نشده، ولی predictionت به شکل معناداری تغییر کرده.

همین تغییر خودش information داره.

TD دقیقاً از همین نوع signal استفاده می‌کنه. اگه state بعدی value بالاتری از چیزی که انتظار داشتیم داشته باشه، اون‌وقت state قبلی هم باید ارزشمندتر بشه. اگه state بعدی value پایین‌تری داشته باشه، state قبلی باید کم‌ارزش‌تر بشه.

TD error شکل عددی همین ایده است:

$$
\delta_t = R_{t+1} + \gamma V(S_{t+1}) - V(S_t).
$$

این دو تا prediction پشت‌سرهم رو با هم مقایسه می‌کنه، البته با در نظر گرفتن ریواردی که بینشون گرفته شده.

اگه immediate reward وجود نداشته باشه، TD error خیلی ساده می‌شه:

$$
\delta_t = \gamma V(S_{t+1}) - V(S_t).
$$

پس state قبلی به سمت discounted value مربوط به state بعدی update می‌شه.

اگه immediate reward وجود داشته باشه، اون ریوارد به next-state value اضافه می‌شه.

برای همین به TD learning می‌گن **temporal-difference** learning: چون از difference بین predictionها در زمان‌های مختلف یاد می‌گیره.

---

## هندل کردن terminal stateها

terminal stateها نیاز به توجه ویژه دارن، چون تو implementationها زیاد باعث bug می‌شن.

اگه $S_{t+1}$ terminal باشه، بعد از اون دیگه هیچ future returnای وجود نداره. بنابراین:

$$
V(S_{t+1}) = 0.
$$

TD target تبدیل می‌شه به:

$$
R_{t+1}.
$$

پس terminal transition update اینه:

$$
V(S_t) \leftarrow V(S_t) + \alpha [R_{t+1} - V(S_t)].
$$

این دقیقاً شبیه یه supervised update به سمت final reward هست.

یه implementation pattern رایج اینه:

```python
if done:
    target = reward
else:
    target = reward + gamma * V[next_state]

V[state] += alpha * (target - V[state])
```

حواست باشه اشتباهی از یه stored value برای terminal state استفاده نکنی، مگر اینکه خودت explicit اون رو روی zero گذاشته باشی.