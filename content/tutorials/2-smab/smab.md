# Standard Multi-Armed Bandits
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/The-RL-Hub/RLH-Material/blob/main/Chapter02%20and%2003/MAB.ipynb)

## مقدمه‌ای بر Multi-Armed Bandits

مسئله‌ی Multi-Armed Bandit (MAB) یه مسئله‌ی مهم توی reinforcement learningـه که به چالش یادگیری از طریق آزمون و خطا می‌پردازه. این اسم از یه مقایسه با یه قمارباز تو کازینو گرفته شده که چند تا دستگاه اسلات (slot machine) جلوش داره. هر دستگاه یه احتمال نامعلوم برای جایزه دادن داره، و هدف اینه که با انتخاب درست، بیشترین سود رو توی طول زمان ببری.

این مسئله کلی کاربرد داره، مثلاً:

- **تبلیغات آنلاین** → انتخاب بهترین تبلیغ برای گرفتن بیشترین کلیک.
- **آزمایش‌های پزشکی** → تست درمان‌های مختلف برای پیدا کردن بهترین روش درمانی.

![A Robot](Pictures/1.jpg)
*شکل 1: تصویری از برگرفته از کورس CS188 دانشگاه برکلی*

> همونطور که قبلاً هم گفته بودیم برخلاف supervised learning که توش مدل با داده‌های برچسب‌دار یاد می‌گیره، reinforcement learning از evaluative feedback استفاده می‌کنه، یعنی مدل بر اساس پاداش‌هایی که می‌گیره، خودش یاد می‌گیره که چی درسته، نه اینکه مستقیم بهش گفته بشه کدوم حرکت بهترینه.

## یادگیری Nonassociative

مسئله‌ی MAB یه nonassociative learning حساب می‌شه، یعنی توش عامل نیازی نداره که برای هر وضعیت یه تصمیم جدا بگیره. هر بار که یه اقدام انتخاب می‌شه، مقدار پاداش فقط به اون اقدام بستگی داره، نه به وضعیت‌های مختلف محیط.

| ویژگی | Nonassociative Learning (MAB) | Associative Learning (Full RL) |
|--------|--------------------------------|---------------------------------|
| وابسته به وضعیت‌های مختلف؟ | ❌ نه | ✅ آره |
| اقدامات همیشه یکی هستن؟ | ✅ آره | ❌ نه، بسته به state فرق دارن |
| مثال کاربردی | انتخاب بین چند slot machine | رانندگی خودکار |

![A Slot machine](Pictures/2.png)
*شکل 2: نمایشی از یک slot machine*

> توی nonassociative learning، عامل نیاز نداره که تصمیماتش رو بر اساس یه وضعیت خاص بگیره، فقط باید بفهمه کدوم گزینه سود بیشتری می‌ده.

> اما تو associative learning، تصمیمات بسته به شرایط تغییر می‌کنن. مثلاً تو شطرنج، بهترین حرکت بستگی به وضعیت صفحه داره.

## تعریف مسئله‌ی Multi-Armed Bandit

یه *$K$-armed bandit* یه جور مسئلهٔ تصمیم‌گیریه که مرحله‌به‌مرحله انجام می‌شه و توش $K$ تا انتخاب مستقل (یا همون arm) وجود داره. توی هر لحظه‌ی زمانی $t=1,2,\dots,$ یه ایجنت باید یکی از این بازوها رو انتخاب کنه، یعنی $A_t \in \{1,2,\dots,K\}$.

وقتی که بازوی $A_t$ رو انتخاب می‌کنه، یه ریوارد عددی به اسم $R_t$ می‌گیره. هر بازو‌ی $i$ یه ریوارد می‌ده که طبق یه توزیع احتمال ثابته، ولی اون توزیعه رو نمی‌دونیم و برای هر بار بازی با اون بازو i.i.d هست و مستقل از بقیه بازوهاست. فرض کن $\mu_i = \mathbb{E}[R_t \mid A_t=i]$ میانگین ریوارد (که نمی‌دونیم چنده) برای بازوی $i$ باشه. هدف اینه که مجموع ریواردها رو توی یه بازه زمانی $T$ مرحله‌ای بیشینه کنیم (یا به‌زبون دیگه، کاری کنیم که از حالت ایده‌آلی که همیشه بهترین بازو رو انتخاب می‌کردیم خیلی عقب نیفتیم).






ما می‌تونیم یه چندتا تابع و متغیر دیگه هم توی این ستینگ با نوتییشن های دیگه تعریف کنیم. *اکشن-ولیو* (Q-value) یه اکشن، یعنی میانگین ریواردی که از اون اکشن می‌گیریم:

$$
q(a) = \mathbb{E}[R \mid A = a].
$$

علاوه بر این، یه دونه مقدار بهینه $v_{\star}$ وجود داره که همون Q-value بهترین اکشن یعنی $a^{\star}$ـه:

$$
v_\star = q(a^\star) = \max_{a \in \mathcal{A}} q(a).
$$

سختی ماجرا اینجاست که ایجنت اولش چیزی از توزیع ریواردهای بازوها نمی‌دونه. باید یه تعادل بین **exploration** (یعنی اینکه بره اطلاعات از بازوهایی که نمی‌شناسه جمع کنه) و **exploitation** (یعنی اینکه همون بازویی که تا الان خوب بوده رو انتخاب کنه) برقرار کنه تا توی بلندمدت ریوارد خوبی بگیره.

اگه بخوایم یه تعریف از مسئله‌ی MAB بدیم، این چیزارو داریم:

- یه **مجموعه‌ی اکشن محدود** $\mathcal{A}$ با $k$ تا اکشن ممکن.
- برای هر اکشن $a$ یه **توزیع ریوارد** $\mathcal{R}^a$ داریم که $R_t \sim \mathcal{R}^{A_t}$ یعنی ریواردی که توی زمان $t$ می‌گیریم.
- هدف اینه که **cumulative reward** توی $T$ مرحله رو بیشینه کنیم:

$$
G_T = \sum_{t=1}^{T} R_{t}.
$$







یه تعریفی بخوایم بگیم، فرض کن $\mu^* = \max_{1\le i\le K} \mu_i$ یعنی بیشترین میانگین ریوارد بین همهٔ بازوها، و فرض کنیم بازوی شمارهٔ ۱ تنها بازوی بهینه‌ست (یعنی $\mu_1=\mu^*$ و برای بقیه‌ی بازوها که شماره‌شون از ۱ بیشتره داریم $\mu_i<\mu^*$). حالا یه چیزی داریم به اسم فاصلهٔ suboptimality که برای بازوی $i$ تعریف می‌شه به این صورت: $\Delta_i := \mu^* - \mu_i$ (پس برای بازوی ۱ داریم $\Delta_1=0$ و برای بقیه که بهینه نیستن $\Delta_i>0$).

یه policy (همون الگوریتم تصمیم‌گیری) که اسمش $\pi$ـه، بازوها رو به‌ترتیب $A_1, A_2, \dots, A_T$ انتخاب می‌کنه، اونم بر اساس چیزایی که تا حالا دیده.

regret بعد از $T$ مرحله، همون مقدار ریواردی‌یه که از دست رفته چون همیشه بازوی بهینه رو انتخاب نکردیم:

$$
R(T) := T\mu^* - \mathbb{E}\Big[\sum_{t=1}^T R_t\Big] = \sum_{i=1}^K \Delta_i \, \mathbb{E}[N_i(T)]
$$

که توش 

$$
N_i(T) = \sum_{t=1}^T \mathbb{1}\{A_t = i\}
$$

یعنی تعداد دفعاتی که تا زمان $T$، بازوی $i$ انتخاب شده.

اگه بخوایم راحت‌تر توضیح بدیم، regret نشون می‌ده الگوریتم ما چقدر با یه oracle که همیشه بهترین بازو رو می‌زنه فاصله داره. یه استراتژی *no-regret* (یا همون *zero-regret*) اونیه که وقتی $T$ خیلی زیاد بشه، نسبت $R(T)/T$ بره سمت صفر (یعنی $R(T)$ به‌صورت زیرخطی با $T$ رشد کنه).

مسئلهٔ bandit یه نمونه‌ٔ کلاسیک از اون دوگانگی معروف exploration–exploitationه: ایجنت باید بازوهایی رو که خوب به نظر می‌رسن *exploit* کنه تا ریوارد بگیره، ولی در عین حال باید اونایی رو هم که کمتر انتخاب کرده بوده *explore* کنه تا شاید اطلاعات جدیدی بگیره—چون ممکنه یه بازوی suboptimal در واقع بهتر از چیزی باشه که تا الان فکر می‌کرده. پیدا کردن یه استراتژی درست‌ودرمون یعنی باید با دقت بین این دوتا هدف که با هم در تضادن، تعادل برقرار کنیم.





## توابع Action-Value و روش‌های تخمین زدن

برای اینکه بتونه تصمیم بگیره، ایجنت یه تخمینی از ارزش هر آرم داره که اونم بر اساس ریواردهایی که تا حالا دیده درست می‌شه. به عنوان تعریف، *تابع مقدار-اکشن* $Q^*(i)$ برای آرم $i$ می‌شه مقدار واقعی مورد انتظار ریواردش:  
$$
Q^*(i) = \mu_i = \mathbb{E}[R_t \mid A_t=i]
$$
طبیعتاً این مقدار $Q^*(i)$ رو ایجنت نمی‌دونه.  
در عوض، تو زمان $t$، ایجنت یه تخمینی داره به اسم $\hat{Q}_t(i)$ واسه هر آرم $i$، که با توجه به ریواردهای قبلی همون آرم به‌دست آورده.  
اوایل کار، این تخمین‌ها می‌تونن الکی انتخاب شن یا بر اساس یه اطلاعات قبلی.

### تخمین با میانگین سمپلا (Sample-average estimation)

ساده‌ترین راه برای اینکه یه تخمین بدون بایاس از $\mu_i$ بگیریم، اینه که میانگین ریواردهایی که تا حالا از آرم $i$ دیدیم رو حساب کنیم.  
فرض کن $N_t(i)$ تعداد دفعاتیه که آرم $i$ تا لحظه‌ی $t$ بازی شده. اگه $N_t(i)>0$ باشه، اون‌وقت مقدار میانگین نمونه‌ای این شکلی می‌شه:

$$
\hat{Q}_t(i) = \frac{1}{N_t(i)} \sum_{\substack{1 \le s \le t:\\A_s = i}} R_s
$$

یعنی همون میانگین ریواردهایی که تا حالا از آرم $i$ گرفتیم.  
طبق قانون اعداد بزرگ، وقتی تعداد دفعات بازی شدن آرم $i$ زیاد بشه ($N_t(i)\to\infty$)، اون تخمینه ($\hat{Q}_t(i)$) هم نزدیک می‌شه به مقدار واقعی ($Q^*(i)$).  
اگه آرم $i$ تا حالا اصلاً بازی نشده باشه ($N_t(i)=0$)، می‌تونیم مقدار اولیه‌ی $\hat{Q}$ رو یه چیز پیش‌فرض بذاریم (که پایین‌تر توی *optimistic initial values* در موردش حرف می‌زنیم).  
این روش مخصوصاً واسه مسائلی که شرایطشون تغییر نمی‌کنه (stationary هستن) خوبه، چون همه‌ی داده‌هایی که تا حالا از اون آرم داشتیم رو در نظر می‌گیره و به همشون وزن مساوی می‌ده.

### Incremental update formula

تو عمل، اینکه بخوایم همه‌ی ریواردهای قبلی رو نگه داریم دردسره. واسه همین، یه فرمول ساده هست که میانگین رو به صورت افزایشی آپدیت می‌کنه.  
فرض کن آرم $i$ توی زمان $t$ بازی شده و ریوارد $R_t$ رو داده.  
اون‌وقت $N_t(i) = N_{t-1}(i)+1$ می‌شه و می‌تونیم تخمینو این‌جوری به‌روز کنیم:

$$
\hat{Q}_t(i) = \hat{Q}_{t-1}(i) + \frac{1}{N_t(i)}(R_t - \hat{Q}_{t-1}(i))
$$

این فرمول از همون تعریف میانگین نمونه‌ای در میاد.  
در واقع، فقط با یه اصلاح کوچیک میانگین جدیدو از قبلی درمیاریم، و از لحاظ ریاضی همون جواب میانگین کامل رو می‌ده.  
مزیتش اینه که هم ساده‌ست، هم نیاز به حافظه‌ی زیاد نداره.










#### **Derivation**

تخمین sample-average تو گام زمانی $$t+1$$ این شکلیه:

$$  
Q_{t+1}(a) = \frac{1}{N_{t+1}(a)} \sum_{i=1}^{N_{t+1}(a)} R_i  
$$

بیایم اینو بر اساس $Q_t(a)$ بازش کنیم:

$$  
Q_{t+1}(a) = \frac{1}{N_{t+1}(a)} \left( \sum_{i=1}^{N_t(a)} R_i + R_t \right)  
$$

چون $Q_t(a)$ میانگین ریواردهایی که قبلاً گرفتیمه:

$$  
Q_t(a) = \frac{1}{N_t(a)} \sum_{i=1}^{N_t(a)} R_i  
$$

اگه طرفای $Q_t(a)$ رو در $N_t(a)$ ضرب کنیم، می‌رسیم به:

$$  
N_t(a) Q_t(a) = \sum_{i=1}^{N_t(a)} R_i  
$$

حالا اینو بذاریم تو اون معادله‌ بالا:

$$  
Q_{t+1}(a) = \frac{1}{N_{t+1}(a)} \left( N_t(a) Q_t(a) + R_t \right)  
$$

بیایم اینو یه شکلی بنویسیم که بتونیم راحت‌تر باهاش آپدیت کنیم:

$$  
Q_{t+1}(a) = Q_t(a) + \frac{1}{N_t(a)} (R_t - Q_t(a))  
$$

این فرم باعث میشه دیگه نیاز نباشه همه‌ی ریواردهای قبلی رو نگه داریم، همون $Q_t(a)$ رو کم‌کم آپدیت می‌کنیم و پیش می‌ریم.




### آپیدت کردن مقادیر با اندازه گام ثابت (برای مسائل غیر ثابت) (Exponential recency-weighting)

اگه ریواردها با گذشت زمان عوض بشن (یعنی مسئله non-stationary باشه)، بهتره که به ریواردهای جدیدتر وزن بیشتری بدیم.  
برای این کار، یه روش هست به اسم آپدیت با گام ثابت:

$$
\hat{Q}_{t}(i) = \hat{Q}_{t-1}(i) + \alpha (R_t - \hat{Q}_{t-1}(i))
$$

که اینجا $\alpha$ یه عدد ثابته بین صفر و یک و نقش نرخ یادگیری رو داره.  
این مدل در واقع یه *میانگین با وزن‌دهی نمایی* حساب می‌شه که وزن داده‌های قبلی رو به صورت نمایی کمتر و کمتر می‌کنه.  
اگه این رابطه رو باز کنیم خواهیم داشت که:

$$  
Q_{t+1}(a) = (1 - \alpha) Q_t(a) + \alpha R_t  
$$

$$  
Q_{t+2}(a) = (1 - \alpha) Q_{t+1}(a) + \alpha R_{t+1}  
$$

اگه بیشتر بازش کنیم:

$$  
Q_{t+2}(a) = (1 - \alpha)^2 Q_t(a) + \alpha (1 - \alpha) R_t + \alpha R_{t+1}  
$$

این روند همین‌جوری ادامه پیدا می‌کنه و نشون می‌ده که ریواردهای قدیمی‌تر تأثیرشون به صورت نمایی کم و کمتر می‌شه:

$$  
Q_t(a) = (1 - \alpha)^t Q_0(a) + \sum_{i=0}^{t-1} \alpha (1 - \alpha)^i R_{t-i}  
$$

که در واقع این نشون‌دهنده‌ی تأثیر **exponential weighting** هست. در واقع توش $R_{(j)}^{(i)}$ یعنی ریوارد $j$ام آرم $i$.  
همین نشون می‌ده که هرچی یه مشاهده قدیمی‌تر باشه، وزنش توی محاسبه کمتر می‌شه و این کاهش هم به صورت نماییه.  
وقتی از $\alpha$ ثابت استفاده می‌کنیم، می‌تونیم سریع‌تر خودمونو با تغییرات وفق بدیم، ولی یه مقداری بایاس هم وارد تخمین می‌شه.  
در مسائل *stationary* بهتره از $\alpha_t = 1/N_t(i)$ استفاده کنیم که با گذشت زمان کم می‌شه. این کار باعث می‌شه تخمینمون به مقدار واقعی نزدیک بشه.  
در واقع اگه $\sum_t \alpha_t = \infty$ و $\sum_t \alpha_t^2 < \infty$ باشه، اون‌وقت $\hat{Q}_t(i)\to \mu_i$ با احتمال یک.  
تو مسائل bandit که *stochastic* و *stationary* هستن، فرض می‌کنیم از همون روش میانگین نمونه‌ای استفاده می‌شه (یا همون $\alpha_t = 1/N_t$)، تا وقتی exploration کافی داشته باشیم، تخمین‌ها به مقدار درستشون برسن.








## داستان Exploration–Exploitation

اینی که ایجنت مقدارها رو درست تخمین بزنه فقط نصف ماجراست؛ باید تصمیم بگیره که تو قدم بعدی سراغ کدوم arm بره. اینجاست که قضیه‌ی اصلیِ exploration–exploitation پیش میاد: بریم سراغ اون armی که الان بیشترین مقدار تخمینی رو داره (یعنی exploitationِ حریصانه)، یا بریم armهای دیگه رو امتحان کنیم شاید یه گزینه‌ی بهتر پیدا کردیم (یعنی exploration)؟  

اگه بخوای فقط exploitation کنی (یعنی همیشه بری سراغ همون armی که فعلاً از بقیه بهتر به نظر می‌رسه)، ممکنه به خاطر یه اتفاق تصادفی اول بازی گیر کنی رو یه armی که در واقع خوب نیست. از اون طرف، اگه فقط بخوای exploration کنی (یعنی همین‌جوری هی armهای تصادفی رو تست کنی)، خب یاد می‌گیری، ولی ریوارد رو فدا می‌کنی دیگه. داستان اینه که باید یه جوری policy بچینیم که بین این دوتا یه تعادلی بزنه و در نهایت regret کمی داشته باشه، اونم نه فقط یه بار، بلکه با یه پشتوانه‌ی ریاضی محکم.

مثلاً یه استراتژی ساده‌ی *greedy* که بعد از چند بار امتحان همیشه می‌ره سراغ 

$$
\arg\max_i \hat{Q}_t(i)
$$

ممکنه حسابی بد عمل کنه. فکر کن arm شماره‌ی ۱ که در واقع بهترینه، همون بار اول یه ریوارد کم بده، بعدش یه arm دیگه مثل $j$ ریوارد خوب بده. الگوریتم greedy ممکنه تا آخرش فکر کنه $j$ بهتره و دیگه هیچ‌وقت نفهمه arm 1 از نظر میانگین انتظارش بالاتره.  
در واقع می‌شه نشون داد اگه exploration کافی نباشه، policy greedy ممکنه regret خطی بده یعنی 

$$
R(T) = \Theta(T)
$$

اونم تو بدترین حالت.پس اگه می‌خوایم رشد regret آهسته و زیرخطی (ترجیحاً لگاریتمی) باشه، explorationِ حساب‌شده لازمه.

قضیه‌ی exploration–exploitation تو یه مفهومی به اسم *optimism in the face of uncertainty* خودش رو نشون می‌ده: اگه مقدار یه arm خیلی نامعلومه (چون هنوز خیلی دیتا ازش نداریم)، یه استراتژی خوش‌بین، فرض می‌کنه ممکنه اون arm خیلی هم خوب باشه، واسه همین می‌ره سراغش و explore می‌کنه. ولی اگه صرفاً exploitative باشی، کلاً uncertainty رو می‌ذاری کنار.

تو بخش‌های بعدی، می‌خوایم چندتا روش رایج رو معرفی کنیم که هر کدوم به یه سبک با این چالش برخورد می‌کنن:  
- $\epsilon$-greedy (یعنی بعضی وقتا به صورت تصادفی explore می‌کنه)،  
- optimistic initial values (یعنی از همون اول یه مقدار بالا می‌ذاره تا ایجنت بره explore کنه)،  
- upper-confidence bounds (که طبق بازه‌های اطمینان جلو می‌ره و سیستماتیک explore می‌کنه)،  
- و Thompson sampling (که یه جور probability matching بیزیه).  

می‌خوایم ویژگی‌های تئوریک اینا رو بررسی کنیم، مخصوصاً اینکه هرکدوم چطوری با مسئله‌ی regret برخورد می‌کنن.
















## Regret: اندازه‌گیری اینکه چقدر تصمیم‌مون بد بوده

بالاتر از کلمه *regret* استفاده کردیم و حالا می‌خوایم بریم سراغ این مفهوم جدید.  
regret یه جورایی بهمون می‌گه که وقتی یه اکشن خاص مثل $A_t$ رو برداشتیم، چقدر ریوارد از دست دادیم نسبت به اون اکشن بهینه‌ یعنی $a^\star$.

به زبون ساده:

$$  
I_t = \mathbb{E}[v_\star - q(A_t)]  
$$

یه چیز دیگه هم داریم به اسم *total regret* که در واقع مجموعِ همین فرصت‌های از دست‌رفته تو کل یه اپیزوده:

$$  
L_t = \mathbb{E}\left[\sum_{\tau=1}^t v_\star - q(A_\tau)\right]  
$$

کاری که ایجنت باید بکنه اینه که total regret رو تا جایی که می‌تونه کم کنه.  
یعنی چی؟ یعنی در واقع باید کاری کنه که ریواردی که توی بلندمدت می‌گیره، بیشینه بشه.

حالا علاوه بر اینا، یه چیزی هم داریم به اسم $N_t(a)$ که نشون می‌ده یه اکشن خاص $a$ رو تا الان چند بار (به‌طور میانگین) انتخاب کردیم.  
یه تعریف دیگه هم هست به اسم *gap* که با $\delta_a$ نشونش می‌دیم.  
این gap اختلاف بین ریوارد مورد انتظار برای یه اکشن $a$ یعنی $q(a)$ و ریوارد بهینه‌ست:

$$  
\Delta_a = v_\star - q(a)  
$$

با این تعریف، می‌تونیم یه تعریف دیگه برای regret یعنی $L_t$ بنویسیم، این‌بار با استفاده از gap:

$$  
\begin{align}  
  L_t &= \mathbb{E}\left[\sum_{\tau=1}^t v_\star - q(A_\tau)\right] \\
      &= \sum_{a \in \mathcal{A}}\mathbb{E}[N_t(a)](v_\star - q(a)) \\
      &= \sum_{a \in \mathcal{A}}\mathbb{E}[N_t(a)]\Delta_a  
\end{align}  
$$

حالا اگه بیایم به regret به عنوان یه تابع از تعداد تکرارها نگاه کنیم، یه سری چیزا دستمون میاد.  
مثلاً می‌فهمیم که اگه از یه الگوریتم greedy استفاده کنیم مثل:

$$  
A_t = \argmax_{a \in \mathcal{A}} Q_t(a)  
$$

اون موقع regret یه روند خطی پیدا می‌کنه.  
یعنی هر بار که جلوتر می‌ریم، regret به همون اندازه بیشتر می‌شه.  
چرا؟ چون ممکنه یه اکشن افتضاح رو انتخاب کنیم و دیگه هم تا تهش بهش گیر بدیم، و همینطوری هر بار یه مقدار ثابت regret بخوریم.

یه راهکار باحال اینه که از اول Q-value همه‌ی اکشن‌هامون رو بذاریم روی بیشترین ریوارد ممکن.  
به این می‌گن *optimistic initialization*.  
آپدیت کردن $Q(a)$ هم با میانگین‌گیری انجام می‌شه:

$$  
Q(a) = \frac{1}{N_t(a)}\sum_{t=1}^T \mathbf{1}(A_t = a)R_t  
$$


![Regret graph](Pictures/3.png)
درسته که روش‌های $\varepsilon$-greedy معمولا regret خطی دارن، ولی اگه $\varepsilon$ رو به مرور زمان کم کنیم، می‌تونیم برسیم به یه regret لگاریتمی.  
در کل، یه حد پایینی برای regret هست که هیچ الگوریتمی بهتر از اون نمی‌تونه عمل کنه، و اونم لگاریتمیه.


## تحلیل regret و کران‌هاش

**کران‌های regret وابسته به مسئله**: توی banditهای تصادفی، هر الگوریتم درست‌حسابی باید بالاخره بفهمه کدوم arm از همه بهتره و بیشتر از همون استفاده کنه، که باعث می‌شه regret زیرخطی داشته باشه. یه نتیجه‌ی معروف از Lai و Robbins توی سال ۱۹۸۵ یه کران پایین پایه‌ای برای سرعت رشد regret ارائه داده. برای هر الگوریتمی که “consistent” باشه (یعنی برای همه‌ی مسئله‌های bandit، regret زیرخطی داشته باشه)، وقتی $T$ خیلی بزرگ بشه، باید regret از این رابطه پیروی کنه:

$$
\liminf_{T\to\infty} \frac{R(T)}{\ln T} \;\ge\; \sum_{i: \mu_i < \mu^*} \frac{\Delta_i}{D_{\text{KL}}(P_i\,\|\,P_{*})}~,
$$

که اینجا $P_{*}$ همون توزیع ریواردِ بهترین arm هست و $D_{\text{KL}}(P_i\|P_{*})$ هم واگرایی Kullback–Leibler بین توزیع arm شماره $i$ و arm بهینه‌ست. این یه کران پایینه که به خود مسئله بستگی داره: یعنی به فاصله‌های خاص $\Delta_i$ و اینکه چقدر توزیع هر arm غیربهینه با arm بهینه فرق داره. راحت‌تر بگم، اگه یه arm فاصله‌ی $\Delta_i$ کمی داشته باشه یا توزیعش خیلی شبیه توزیع arm بهینه باشه (یعنی $D_{\text{KL}}$ کوچیکی داشته باشه)، یاد گرفتن اون سخت‌تره و exploration بیشتری لازم داره – واسه همین توی کران پایین regret سهم بیشتری داره.

برای اینکه یه مثال واضح‌تر بزنیم، فرض کن ریواردها Bernoulli باشن ($P_i = \mathrm{Bernoulli}(\mu_i)$)، اون‌وقت داریم:

$$
D_{\text{KL}}(P_i\|P_{*}) = \mu^* \ln\left(\frac{\mu^*}{\mu_i}\right) + (1-\mu^*)\ln\left(\frac{1-\mu^*}{1-\mu_i}\right)
$$

و این کران نشون می‌ده که تقریباً 

$$
R(T) \gtrsim \sum_{i: \mu_i<\mu^*} \frac{\ln T}{\mu^* - \mu_i}
$$

تا یه سری فاکتور ثابت. یعنی *هیچ الگوریتمی نمی‌تونه کاری کنه که regret رشدش از لگاریتمی بهتر باشه* (وقتی وابسته به خود مسئله بررسی کنیم) – یعنی $\Omega(\ln T)$ یه کران پایه‌ایه که پایین‌تر از اون نمی‌تونیم بریم.

**regret minimax**: یه دید دیگه اینه که بگیم بدترین حالت regret برای همه‌ی نمونه‌های ممکن چی می‌تونه باشه (مثلاً وقتی تعداد armها مشخصه و ...). توی حالت adversarial، regret minimax برای banditهای $K$-تایی تقریباً به صورت $\Theta(\sqrt{KT})$ رشد می‌کنه. ولی برای حالت stochastic، وقتی فاصله‌ها ثابت باشن، اون رفتار وابسته به مسئله که $\Theta(\ln T)$ هست، کاربردی‌تر و قابل فهم‌تره. توی این فصل، می‌خوایم روی همین تحلیل‌های وابسته به مسئله تمرکز کنیم.

قراره ببینیم که یه سری الگوریتم معروف مثل UCB و Thompson sampling می‌تونن regret حدود $R(T) = O(\ln T)$ داشته باشن که از نظر مرتبه رشد، با کران پایین Lai–Robbins یکیه (و حتی گاهی از نظر فاکتور ثابت هم باهاش برابره). این regret لگاریتمی خیلی بهتر از یه چیزی مثل $\epsilon$-greedy ثابته، که به خاطر exploration دائمی، regretش خطی درمیاد. هدف توی طراحی الگوریتم اینه که به regret زیرخطی برسیم، اگه بشه که $O(\ln T)$ باشه، خیلی ایده‌آله؛ اونم با یه بالانس هوشمندانه بین exploration و exploitation.




## استراتژی‌های Exploration برای Multi-Armed Bandits

تا حالا چندتا استراتژی معروف طراحی شدن برای اینکه بشه بین exploration و exploitation توی multi-armed bandits یه تعادلی برقرار کرد. اینجا قراره چهار تا از رایج‌ترین روشا رو بررسی کنیم و ببینیم چه جوری کار می‌کنن و از نظر تئوری چه تضمینی دارن.

### $\epsilon$-Greedy

استراتژی $\epsilon$-greedy از ساده‌ترین روشای explorationه. داستانش اینطوریه که: *بیشتر وقتا* (با احتمال $1-\epsilon$)، ایجنت میاد و همون armی رو انتخاب می‌کنه که تا حالا بهتر جواب داده، ولی یه وقتایی هم (با احتمال کم $\epsilon$) همینجوری رندوم یه arm انتخاب می‌کنه و یه جورایی دست به exploration می‌زنه. دقیق‌تر بخوای بدونی، توی زمان $t$:

- با احتمال $\epsilon$، یه arm تصادفی $A_t$ رو از بین $\{1,\dots,K\}$ انتخاب می‌کنه (یعنی همون “exploration step”).
- با احتمال $1-\epsilon$، $A_t$ رو برابر با $\arg\max_i \hat{Q}_{t-1}(i)$ می‌ذاره، یعنی همونی که تا الان بهترین امتیازو داشته (“greedy exploitation”).

اینجا $\epsilon$ یه عدد بین صفر تا یکه (مثلاً معمولاً می‌ذارنش روی $0.1$)، و معمولاً کوچیکه که exploration خیلی زیاد نشه. اینطوری معمولا ایجنت می‌ره سراغ armی که فعلاً از بقیه بهتر نشون داده ولی گه‌گاهی هم یه نگاهی به بقیه می‌ندازه.

راجع به regretش: الگوریتم $\epsilon$-greedy آخرش می‌تونه arm بهینه رو پیدا کنه، چون همیشه یه درصد کمی احتمال exploration وجود داره و در نتیجه هر armی یه روزی دوباره امتحان می‌شه. اگه $t$ بره به سمت بینهایت، مقدار $\hat{Q}_t$ برای همه‌ی armها به مقدار واقعی‌شون یعنی $\mu$ نزدیک می‌شه (چون بالاخره هر arm بی‌نهایت بار انتخاب می‌شه به خاطر اون احتمال کوچیک exploration).  
ولی مشکل اینجاست که اگه $\epsilon$ رو ثابت نگه داریم، همیشه یه بخش ثابتی از انتخاب‌ها رندوم باقی می‌مونه، و این باعث می‌شه regret با سرعت خطی با $T$ زیاد بشه. چون توی حدود $\epsilon T$ بار داریم armی رو انتخاب می‌کنیم که شاید gap بالایی داشته باشه (مثلاً تا $\Delta_{\max}$). حتی توی طولانی‌مدت هم regret مرحله‌ای می‌ره سمت $\epsilon \Delta_{\text{avg}}$ (یعنی یه gap متوسط توی انتخاب‌های تصادفی). خلاصه، $\epsilon$ ثابت باعث می‌شه الگوریتم از نظر تئوری چندان خوب نباشه (asymptotically optimal نیست).

اگه بخوایم regret ای sublinear داشته باشیم، باید $\epsilon$ رو به مرور کم کنیم. یه روش رایج اینه که از یه برنامه‌ی کاهش مثل 

$$
\epsilon_t = \frac{1}{t} \quad \text{یا} \quad \epsilon_t = c \frac{\ln t}{t}
$$

استفاده کنیم که با زیاد شدن تجربه، مقدار exploration کم و کمتر بشه. اگه این کاهش رو درست انجام بدیم، الگوریتم $\epsilon$-greedy می‌تونه regret به اندازه $O(\ln T)$ بده.

یه مثال دقیق‌ترش هم اینه:

$$
\epsilon_t = \min\left\{1, \frac{K}{t \Delta^2}\right\}
$$

(البته این یکی نیاز داره که مقدار gapها یعنی $\Delta_i$‌ها رو بدونیم)، یا برنامه‌های مشابه. توی این شرایط، regret می‌ره به سمت $O(\ln T)$.

ولی راستش رو بخوای، تنظیم کردن این برنامه‌ها توی عمل یکم دردسره و حتی با برنامه‌ی کاهش هم، $\epsilon$-greedy معمولاً نسبت به روش‌های پیشرفته‌تر، ضرایب بزرگ‌تری توی regret داره.

خلاصه‌ش اینه که $\epsilon$-greedy ساده‌ست، اگه $\epsilon$ رو به‌آرومی کم کنیم بدک کار نمی‌کنه، ولی از نظر تئوری هنوز یه پله عقب‌تر از استراتژی‌های خفن‌تره. با این حال، ایده‌ی کلی exploration رندوم رو قشنگ نشون می‌ده و یه baseline خوبه واسه مقایسه کردن روش‌ها.





### مقادیر اولیه خوش‌بینانه (Optimistic Initial Values)

به‌جای اینکه بعضی وقتا یه‌دفعه‌ یه اکشن رندوم بزنی واسه exploration (مثل کاری که $\epsilon$-greedy می‌کنه)، یه راه دیگه‌ش اینه که از اول مقدارهای تخمینی رو یه جوری خوش‌بینانه بذاری که ایجنت مجبور شه بره همه‌ی armها رو تست کنه. تو این روش که بهش optimistic initial values می‌گن، ما از همون اول $\hat{Q}_0(i)$ رو برای همه‌ی armها یه مقدار بالا در نظر می‌گیریم، اونم عمداً بیشتر از چیزی که احتمالاً واقعیه. مثلاً اگه ریواردها بین ۰ تا ۱ باشن، می‌تونی همه‌ی $\hat{Q}_0(i)$ها رو بذاری ۱. 

$$
\hat{Q}_0(i) = 1 \quad \text{for all arms } i
$$

اولش چون همه‌ی تخمینا مثل همن و ته تهش هستن، ایجنت می‌تونه هر armی که دلش خواست رو انتخاب کنه؛ ولی بعد از هر بار بازی، تخمینه‌ی اون arm احتمالاً از اون سطح خوش‌بینی میاد پایین، واسه همین ایجنت می‌ره سراغ armهای دیگه تا ببینه کدوم هنوز بیشترین تخمینو داره.

در واقع، ایجنت فکر می‌کنه همه‌ی armها خفنن، تا وقتی خلافش ثابت شه، واسه همین دونه‌دونه می‌ره سراغ همه‌شون تا یه شناخت اولیه پیدا کنه.

این روش کمک می‌کنه که از اول خوب explore کنه، بدون اینکه لازم باشه اکشن تصادفی بزنه. وقتی به اندازه‌ی کافی دیتا جمع بشه و بفهمه که بعضی armها اونقدرا هم خوب نیستن، دیگه خودش خودکار می‌ره سمت اون armی که بهتره. این روش مخصوصاً تو محیط‌هایی که همه‌چی ثابته (stationary)، خیلی خوب جواب می‌ده. یعنی یه دوره‌ی کوتاه اولش شدید explore می‌کنی، بعدش دیگه می‌ری سراغ exploitation با تخمین‌های بهتر. فقط باید حواست باشه که اون سطح خوش‌بینی‌ت رو درست انتخاب کنی؛ باید از میانگین واقعی بالاتر باشه که ایجنت بره دنبالشون، ولی اگه زیادی خوش‌بین باشی، ممکنه armهای ضعیف رو هم زیادی تست کنی و وقت تلف شه.  

از لحاظ تئوری، اگه اون خوش‌بینی زیاد باشه ولی نه بی‌نهایت، باز هم regret نهایی تو $O(\ln T)$ می‌مونه، چون در نهایت هر arm بد فقط یه تعداد محدودی کشیده می‌شه، به‌علاوه‌ی یه مقدار اضافه که لازمه تا مطمئن بشه واقعاً اون arm خوب نیست.

$$
\text{Regret}_{\text{optimistic}} = O(\ln T)
$$

تو عمل، این روش باعث می‌شه زودتر arm درست حسابی رو پیدا کنی، نسبت به $\epsilon$-greedy که explorationش رو تو طول زمان پخش می‌کنه.

اگه بخوای یه‌جوری تعریفش کنیم (formally)، optimistic initialization شبیه اینه که از اول یه prior bias بذاری. یعنی اولش $\hat{Q}$ همه‌ی میانگین‌های واقعی $\mu_i$ رو زیادتر از چیزی که واقعاً هست تخمین می‌زنه، و هر arm تا وقتی کشیده می‌شه که اون تخمینش بیاد پایین و نزدیک بشه به $\mu_i$.

$$
\hat{Q}(i) \to \mu_i \quad \text{as more outcomes are observed}
$$

بعد از اون، armهای ضعیف‌تر (احتمال زیاد) مقدار تخمین‌شون از arm قوی‌تر کمتر می‌شه و الگوریتم هم دیگه بیشتر رو همون بهترین arm تمرکز می‌کنه. این خوش‌بینی باعث می‌شه هیچ armی زود کنار گذاشته نشه فقط چون دیتا کم بوده.




### الگوریتم‌های Upper Confidence Bound (UCB)

روش upper confidence bound یه روش حساب‌شده‌س که واسه هر بازو یه *confidence interval* در نظر می‌گیره واسه ریواردش. به‌جای اینکه الکی exploration کنیم، الگوریتمای UCB اون بازویی رو انتخاب می‌کنن که بیشترین کران بالا رو توی بازه‌ی ممکن واسه مقدار واقعی‌ش داشته باشه. ایده‌ش اینه که اون مقدار نامطمئنی که تو تخمین داریم رو به چشم یه امتیاز اضافه نگاه کنیم: یعنی اون بازوی $i$ رو انتخاب کنیم که $\hat{Q}_{t-1}(i) + U_{t-1}(i)$ رو ماکسیمم می‌کنه، جایی که $U_{t-1}(i)$ همون *upper confidence term* ـه که وقتی $N_{t-1}(i)$ کمه (یعنی هنوز اون بازو زیاد تست نشده) بزرگه و هرچی بیشتر انتخابش کنیم، این term کوچیک‌تر می‌شه. با این کار، policy خودش خودبه‌خود بین exploitation از بازوهای خوب و exploration اونایی که هنوز درست حسابی تست نشدن بالا پایین می‌ره.

### تعریف UCB1

یه نمونه‌ی معروفش الگوریتم UCB1 هست که Auer و بقیه سال ۲۰۰۲ معرفی کردن. فرض می‌کنیم ریواردها تو یه بازه‌ی مشخص (مثلاً $[0,1]$) باشن، اون وقت می‌تونیم با استفاده از نابرابری Hoeffding واسه هر بازو یه confidence interval درست کنیم.

یه یادآوری از نابرابری Hoeffding: اگه $X_1,\dots,X_n$ مستقل و هم‌توزیع توی بازه‌ی $[0,1]$ باشن و میانگین‌شون $\mu$ باشه، اون وقت واسه هر $\delta>0$ داریم:

$$
\Pr\Big\{\mu > \bar X_n + u\Big\} \le e^{-2n u^2}
$$

یعنی این یه کران بالاس واسه احتمال اینکه میانگین واقعی بیشتر از میانگین نمونه‌ای به‌علاوه یه مقدار $u$ بشه. یعنی می‌گه احتمال اینکه تفاوت بین میانگین واقعی و نمونه‌ای بیشتر از $u$ باشه، از این حد بالاتر نمی‌ره.

حالا واسه کار ما، می‌تونیم $q(a)$ رو جای میانگین واقعی، $Q_t(a)$ رو جای میانگین نمونه‌ای و $U_t(a)$ رو جای اون مقدار کران بالا بذاریم. پس می‌رسیم به این:

$$
\Pr[q(a) > Q_t(a) + U_t(a)] \leq e^{-2N_t(a)U_t(a)^2}
$$

الان با این رابطه می‌تونیم $U_t(a)$ رو حساب کنیم. اگه یه مقدار احتمال دلخواهمون (مثلاً $p$) واسه confidence داشته باشیم، اون وقت داریم:

$$
\begin{align}
  e^{-2N_t(a)U_t(a)^2} &= p \\
  -2N_t(a)U_t(a)^2 &= \log p \\
  U_t(a)^2 &= \frac{\log p}{-2N_t(a)} \\
  U_t(a) &= \sqrt{\frac{\log p}{-2N_t(a)}}
\end{align}
$$

که توش $\bar X_n$ همون میانگین سمپله.

به زبون ساده‌تر، با احتمال حداقل $1-\delta$، می‌تونیم بگیم:

$$
\mu \le \bar X_n + \sqrt{\frac{\ln(1/\delta)}{2n}}
$$

اگه اینو واسه ریوارد بازوی $i$ پیاده کنیم، بعد از $N_{t-1}(i)$ بار اجرا، یه upper confidence bound داریم واسه $\mu_i$:

$$
\text{UCB}_t(i) = \hat{Q}_{t-1}(i) + \sqrt{\frac{\ln(1/\delta_{t-1})}{2\,N_{t-1}(i)}}
$$

که این رابطه با احتمال زیاد (حدوداً $1 - \delta_{t-1}$) برقرار می‌مونه. توی UCB1 میان $\delta_t$ رو جوری تنظیم می‌کنن که با بزرگ شدن $t$ کوچیک‌تر بشه (مثلاً $\delta_t = 1/t^4$ یه انتخاب خوب و راحته) تا با union bound مطمئن بشیم که confidence برای کل زمان‌ها حفظ می‌شه.

یه انتخاب ساده‌شده‌ش اینه که بذاریم $\delta_t = 1/t^2$، که منجر می‌شه به فرمول معروف UCB1:

$$ 
\text{UCB}_t(i) = \hat{Q}_{t-1}(i) + \sqrt{\frac{2 \ln t}{N_{t-1}(i)}}
$$

و الگوریتم تو هر زمان $t$ اون بازویی رو انتخاب می‌کنه که این مقدار رو بیشینه کنه:

$$
A_t = \arg\max_{i} \text{UCB}_t(i)
$$

یعنی *در زمان $t$، بازویی رو انتخاب کن که $\hat{Q}_{t-1}(i) + \sqrt{\frac{2\ln t}{N_{t-1}(i)}}$ رو بیشینه کنه.*

این فرمول یه حس شهودی هم داره: جمله‌ی اول یعنی exploitation، همون میانگین نمونه‌ای فعلیه؛ جمله‌ی دومم یه exploration bonus هست که وقتی $N_{t-1}(i)$ کوچیکه یا اولای کاریم (یعنی $\ln t$ بزرگه) بیشتر می‌شه. هرچی زمان بگذره، این bonus واسه بازوهایی که زیاد استفاده شدن کمتر می‌شه، ولی اونایی که هنوز درست تست نشدن، bonus خوبی می‌گیرن و باعث می‌شن الگوریتم مجبور شه اونا رو تست کنه. اون فرم $\sqrt{\frac{2\ln t}{N}}$ هم باعث می‌شه اول کار همه بازوها تست بشن (چون $N$ کمه)، و رشد لگاریتمی $\ln t$ باعث می‌شه سرعت تست کردن بازوهای کمتر استفاده‌شده، به‌آرومی با زمان زیاد شه.

#### تحلیل Regret

الگوریتم UCB1 (و نسخه‌های دیگه‌ش) تضمین‌های خوبی برای regret دارن. توی حالت UCB1، Auer و بقیه نشون دادن که برای هر بازوی ضعیف‌تر $i$، داریم:

$$ 
\mathbb{E}[N_i(T)] \le \frac{8 \ln T}{\Delta_i^2} + O(1) 
$$

که اینم به این معنیه که انتظار داریم مجموع regret این شکلی باشه:

$$
\mathbb{E}[R(T)] \le \sum_{i: \Delta_i>0} \Delta_i \Big(\frac{8 \ln T}{\Delta_i^2} + O(1)\Big) = O\Big(\sum_{i: \Delta_i>0} \frac{\ln T}{\Delta_i}\Big) = O(\ln T)
$$

یعنی UCB1 تو سطح $O(\ln T)$ عملکرد خوبی داره، که تقریباً همون کران پایین معروفه، فقط با یه ضریب ثابت فرق داره.

یه نکته مهم اینکه الگوریتمای UCB *problem dependent* هستن: اگه فاصله‌ی $\Delta_i$ زیاد باشه، regret کم‌تره. یعنی تقریباً $\sim (2/\Delta_i^2)\ln T$ بار صرف می‌کنن تا بفهمن یه بازو خوب نیست.

کلی بهبود و نسخه‌ی مختلف از UCB داریم. مثلاً KL-UCB به‌جای نابرابری Hoeffding از کران‌های Kullback–Leibler استفاده می‌کنه، که به‌مرور دقیقاً به کران پایین Lai–Robbins می‌رسه.

رویکرد UCB رو حتی می‌تونیم به تنظیمات دیگه مثل contextual یا adversarial bandits هم گسترش بدیم (با یه‌کم تغییر). ولی تو حالت استاندارد stochastic، UCB یه انتخاب ساده، سرراست و قویه که کلی تضمین تئوریک داره.






### روش Thompson Sampling (Bayesian Probability Matching)

Thompson Sampling (که بهش TS هم می‌گن) یه رویکرد Bayesian برای مسئله‌ی bandit هست که خیلی معروف شده چون هم ساده‌ست هم خوب جواب می‌ده. این الگوریتم رو اول بار Thompson تو سال ۱۹۳۳ پیشنهاد داد. ایده‌ش *probability matching*ـه: برای هر arm یه توزیع posterior از پارامترهاش (مثلاً میانگین ریواردش) نگه می‌داره، بعد تو هر مرحله، یه arm رو به صورت تصادفی انتخاب می‌کنه، بر اساس اینکه چقدر احتمال داره اون بهترین arm باشه  
([لینک به پست Lil'Log](https://lilianweng.github.io/posts/2018-01-23-multi-armed-bandit/#:~:text=At%20each%20time%20step%2C%20we,probability%20that%20a%20is%20optimal)).

تو عمل، کاری که می‌کنه اینه که از هر arm یه مقدار ممکن برای میانگینش (از روی posteriorش) نمونه‌گیری می‌کنه، بعد اون armی که بیشترین مقدار رو آورده انتخاب می‌شه.

#### الگوریتم TS برای Bernoulli Bandits:

برای اینکه بهتر جا بیفته، بیایم یه حالت ساده رو ببینیم که توش ریواردهای هر arm برنولی هستن ($R_t \in \{0, 1\}$ یعنی موفقیت یا شکست). برای هر arm یه prior از نوع Beta می‌ذاریم روی احتمال موفقیتش، یعنی $\theta_i = \Pr(R = 1 | A = i)$. اولش مثلاً می‌تونیم از prior یکنواخت استفاده کنیم $\theta_i \sim \mathrm{Beta}(1,1)$، که یعنی هنوز هیچی نمی‌دونیم.

بعدش تو هر دور $t$، Thompson Sampling این مراحلو انجام می‌ده:

1. برای هر arm، یه مقدار $\tilde{\theta}_i^{(t)}$ از توزیع posterior فعلی‌ش نمونه‌گیری می‌کنیم. تو حالت Beta-Bernoulli یعنی $\tilde{\theta}_i \sim \mathrm{Beta}(\alpha_i, \beta_i)$ که توش $\alpha_i$ تعداد موفقیت‌های قبلی و $\beta_i$ تعداد شکست‌ها رو نشون می‌ده.

2. اون armی رو انتخاب می‌کنیم که بیشترین مقدار نمونه‌گیری‌شده رو آورده:  
   
   $$
   A_t = \arg\max_i \tilde{\theta}_i^{(t)}
   $$

3. همون arm یعنی $A_t$ رو اجرا می‌کنیم و ریوارد $R_t \in \{0,1\}$ رو می‌بینیم.

4. بعدش با قانون Bayes، posterior اون arm رو آپدیت می‌کنیم. تو حالت Beta-Bernoulli یعنی $\alpha_{A_t}$ رو به اندازه‌ی $R_t$ و $\beta_{A_t}$ رو به اندازه‌ی $1 - R_t$ زیاد می‌کنیم. پارامترهای بقیه armها هم دست‌نخورده می‌مونن.

این روند خودش یه جورایی بین exploration و exploitation تعادل ایجاد می‌کنه. armهایی که معمولاً خوبن (یعنی $\theta$ بالایی دارن) احتمالاً مقدار نمونه‌گیری‌شده‌ی بالاتری دارن و بیشتر انتخاب می‌شن. ولی اگه یه arm هنوز نامطمئن باشه (posteriorش گسترده باشه)، ممکنه یه مقدار بالایی به‌طور تصادفی ازش نمونه‌گیری بشه و باعث شه امتحانش کنیم؛ یعنی exploration بشه.

در واقع Thompson Sampling یه جور *randomized optimism* حساب می‌شه: بعضی وقتا یه arm که داده‌های کمی داره، ممکنه شانسی مقدار بالایی تو نمونه‌گیری بیاره و امتحان شه.

ما تا الان فقط حالت Bernoulli با prior از نوع Beta رو گفتیم، که اینا conjugate هستن، ولی TS رو می‌شه برای توزیع‌های ریوارد دیگه هم استفاده کرد، فقط باید prior مناسب انتخاب کنیم. مثلاً اگه ریواردها Gaussian باشن و میانگینشون نامعلوم باشه، می‌تونیم برای هر میانگین، prior نرمال بگیریم.

#### Bayesian و frequentist regret:

TS در ابتدا به‌عنوان یه جواب Bayesian بهینه برای یه مسئله‌ی bandit تعریف شد (یعنی هدفش کم کردن expected regret با فرض اینکه یه prior روی نوع مسئله داریم). ولی بعداً از دیدگاه frequentist هم بررسی شده.

نکته‌ی جالب اینه که TS می‌تونه با احتمال بالا و حتی تو امید ریاضی، یه regret از مرتبه‌ی $O(\ln T)$ برای banditهای تصادفی ایجاد کنه؛ یعنی هم‌رده‌ی UCB قرار می‌گیره. مثلاً برای Bernoulli banditها، ثابت شده که TS این رابطه رو برقرار می‌کنه:

$$
\mathbb{E}[R(T)] = O\Big(\sum_{i: \Delta_i>0} \frac{1}{\Delta_i^2}\ln T\Big)
$$

([](http://proceedings.mlr.press/v23/agrawal12/agrawal12.pdf#:~:text=Theorem%202%20For%20the%20N,%EF%A3%AD%20X%20N%20a%3D2%201))

این کران یه کم از نظر وابستگی به فاصله (gap) ضعیف‌تر از UCB هست، چون توی مخرجش $\Delta_i^2$ هست ولی تو UCB فقط $\Delta_i$ بود. با این حال از نظر مرتبه، همون $O(\ln T)$ هست. حتی آنالیزهای دقیق‌تر نشون دادن که TS می‌تونه asymptotically به کران پایینی Lai–Robbins برای خیلی از توزیع‌ها برسه، یعنی به‌طور بلندمدت *asymptotically optimal* هست.

چون TS یه روش Bayesian هست، معمولاً تو عمل هم تو موقعیت‌های پیچیده خوب جواب می‌ده و بدون اینکه لازم باشه نرخ exploration یا confidence خاصی تعریف کنیم، خودش قضیه‌ی exploration–exploitation رو هندل می‌کنه.

#### مهم:

یه مزیت خیلی خوب TS اینه که پیاده‌سازی‌ش راحته و انعطاف‌پذیره. برای هر arm یه posterior نگه می‌داره و از strategyی به اسم "probability matching" استفاده می‌کنه – که از نظر مفهومی هم آسونه. به‌طور تجربی، TS خیلی جاها عملکردش هم‌رده یا حتی بهتر از UCB بوده، مخصوصاً وقتی از prior مناسب استفاده بشه. آنالیزهای regret برای TS که Agrawal و Goyal و بعدتر Kaufmann و بقیه انجام دادن (حدود ۲۰۱۲)، خیلی راحت نبود، ولی نشون دادن که TS فقط یه heuristic نیست، بلکه یه الگوریتم بهینه‌ست برای banditها.

علاوه‌بر این، TS به‌راحتی می‌تونه دانش قبلی ما از armها رو تو خودش جا بده، که تو شرایط cold-start حسابی به درد می‌خوره.
