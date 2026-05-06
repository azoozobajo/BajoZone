-- BajoZone seed data generated from data/db.json

begin;

insert into public.site_settings (id, site_name_ar, site_name_en, tagline_ar, tagline_en, about_ar, about_en, about_image, logo, favicon, ticker_ar, ticker_en, about_content_ar, about_content_en, social, about_gallery, popup, new_article_bar)
values
  ('main', 'باجو زون', 'BajoZone', 'منصة اكتشاف وتطوير المواهب في كرة القدم', 'Football Talent Identification & Development Platform', 'أنا عبدالعزيز باجخيف، أكتب في BajoZone من نقطة التقاء العلم بالميدان: علوم الرياضة، اكتشاف المواهب، تطوير اللاعبين، وتجارب كرة القدم في الفئات السنية. هذه المساحة ليست سيرة ذاتية، بل قصة معرفة وتجربة وتحليل.', 'I am Abdulaziz Bajkhaif. Through BajoZone, I write where sports science meets the field: talent identification, player development, youth football, and lived football experiences. This is not a resume page; it is a story of learning, observation, and analysis.', '', 'assets/images/logo-bajo.png', 'assets/images/logo-bajo.png', 'اكتشاف المواهب ✦ تطوير اللاعبين ✦ كشافة كرة القدم ✦ علوم الرياضة ✦ BajoZone', 'Talent Identification ✦ Player Development ✦ Football Scouting ✦ Sports Science ✦ BajoZone', '', '', '{"whatsapp":{"value":"","visible":false},"email":{"value":"","visible":false},"phone":{"value":"","visible":false},"snapchat":{"value":"","visible":false},"tiktok":{"value":"","visible":false},"facebook":{"value":"","visible":false},"instagram":{"value":"","visible":false},"twitter":{"value":"","visible":false}}'::jsonb, '[]'::jsonb, '{"enabled":true,"delay":2,"message_ar":"مرحباً بك في باجو زون — منصة المحتوى الرائد في اكتشاف وتطوير المواهب الكروية.","message_en":"Welcome to BajoZone — your platform for football talent discovery and development.","image":"assets/images/logo-bajo.png"}'::jsonb, '{"enabled":true}'::jsonb)
on conflict (id) do update set
  site_name_ar = excluded.site_name_ar,
  site_name_en = excluded.site_name_en,
  tagline_ar = excluded.tagline_ar,
  tagline_en = excluded.tagline_en,
  about_ar = excluded.about_ar,
  about_en = excluded.about_en,
  about_image = excluded.about_image,
  logo = excluded.logo,
  favicon = excluded.favicon,
  ticker_ar = excluded.ticker_ar,
  ticker_en = excluded.ticker_en,
  about_content_ar = excluded.about_content_ar,
  about_content_en = excluded.about_content_en,
  social = excluded.social,
  about_gallery = excluded.about_gallery,
  popup = excluded.popup,
  new_article_bar = excluded.new_article_bar;

insert into public.programs (id, slug, name_ar, name_en, short_description_ar, short_description_en, description_ar, description_en, logo_url, accent_color, sort_order, is_active)
values
  ('prog1', 'sports-concepts', 'مفاهيم رياضية', 'Sports Concepts', 'شرح المصطلحات والمفاهيم الأساسية في الرياضة وكرة القدم بلغة واضحة وعميقة.', 'Explaining fundamental sports and football concepts in clear, in-depth language.', 'برنامج يشرح المصطلحات والمفاهيم الأساسية في الرياضة وكرة القدم بلغة واضحة وعميقة، لبناء قاعدة معرفية تساعد القارئ على فهم الموهبة، التدريب، الإدارة، والتطوير.', 'A program explaining fundamental sports and football concepts in clear, in-depth language — building the knowledge base needed to understand talent, coaching, management, and development.', '', '#c8a86e', 1, true),
  ('prog2', 'narrow-angle', 'الزاوية الضيقة', 'The Narrow Angle', 'تحليل تفاصيل دقيقة في كرة القدم وربطها بالثقافة والهوية وطريقة اللعب.', 'Analyzing fine details in football and linking them to culture, identity, and playing style.', 'برنامج تحليلي وتأملي يناقش تفاصيل دقيقة في كرة القدم، ويربطها بالثقافة، البيئة، السلوك، الهوية، وطريقة اللعب.', 'An analytical and reflective program discussing fine details in football and linking them to culture, environment, behavior, identity, and style of play.', '', '#8b9eb0', 2, true),
  ('prog3', 'talentlab', 'مختبر الموهبة', 'TalentLab', 'أبحاث ودراسات حديثة في اكتشاف المواهب تتحول إلى فهم عملي.', 'Modern talent research and studies transformed into practical understanding.', 'برنامج علمي يستعرض الأبحاث والدراسات والتجارب الحديثة المرتبطة باكتشاف المواهب وتطويرها، ويحوّل نتائجها إلى فهم عملي للمدرب، اللاعب، الكشاف، الأكاديمية، وولي الأمر.', 'A scientific program reviewing modern research, studies, and experiments related to talent identification and development — transforming findings into practical understanding for coaches, players, scouts, academies, and parents.', '', '#5a9e7a', 3, true),
  ('prog4', 'models-under-microscope', 'نماذج تحت المجهر', 'Models Under the Microscope', 'تحليل النماذج والأفكار التي طُبقت في كرة القدم وتطوير المواهب.', 'Analyzing models and ideas applied in football and talent development.', 'برنامج يحلل النماذج والأفكار التي طُبقت في كرة القدم وتطوير المواهب، مثل TIPS في أياكس، Bio-Banding، نماذج الأكاديميات، وبرامج الاتحادات.', 'A program analyzing models and ideas applied in football and talent development — including TIPS at Ajax, Bio-Banding, academy models, and federation programs.', '', '#9b7ec8', 4, true),
  ('prog5', 'stories-behind-talent', 'يُحكى أن', 'Stories Behind Talent', 'حكايات وتجارب من عالم كرة القدم تستخرج المعنى خلف القصة.', 'Stories and experiences from the football world that extract meaning behind the narrative.', 'برنامج قصصي وسردي يعرض حكايات وتجارب من عالم كرة القدم: لاعب، كشاف، مدرب، أكاديمية، قرار، أو لحظة غيّرت المسار، بهدف استخراج المعنى خلف القصة.', 'A narrative program presenting stories and experiences from the football world — a player, scout, coach, academy, decision, or moment that changed a course — aiming to extract meaning behind the story.', '', '#c87e5a', 5, true),
  ('prog6', 'scouts-eye', 'عين الكشاف', 'Scout''s Eye', 'كيف يرى الكشاف اللاعب وتتحول المشاهدة إلى ملاحظة منظمة.', 'How the scout sees the player and how observation becomes organized reading.', 'برنامج عملي يشرح كيف يرى الكشاف اللاعب، وكيف تتحول المشاهدة العادية إلى ملاحظة منظمة وقراءة أعمق للأداء والموهبة.', 'A practical program explaining how the scout sees the player, and how ordinary watching transforms into organized observation and deeper reading of performance and talent.', '', '#5a7ec8', 6, true),
  ('prog7', 'behind-the-numbers', 'خلف الأرقام', 'Behind the Numbers', 'شرح البيانات والإحصائيات الرياضية بطريقة مبسطة وناقدة.', 'Explaining sports data and statistics in a simplified and critical way.', 'برنامج يشرح البيانات والإحصائيات الرياضية بطريقة مبسطة وناقدة، مثل xG، بيانات GPS، السرعة، المسافات، ومؤشرات الأداء، مع توضيح حدود الأرقام.', 'A program explaining sports data and statistics in a simplified and critical way — including xG, GPS data, speed, distances, and performance indicators — while clarifying the limits of numbers.', '', '#e8b84b', 7, true),
  ('prog8', 'decision-room', 'غرفة القرار', 'Decision Room', 'ما يحدث خلف الملعب: بناء الفريق، إدارة المواهب، واستراتيجيات الأندية.', 'What happens behind the pitch: team building, talent management, and club strategies.', 'برنامج يناقش ما يحدث خلف الملعب: بناء الفريق، إدارة المواهب، قرارات التعاقد، تصعيد اللاعبين، أدوار المدير الرياضي، واستراتيجيات الأندية.', 'A program discussing what happens behind the pitch: team building, talent management, signing decisions, player promotion, sporting director roles, and club strategies.', '', '#c85a5a', 8, true),
  ('prog9', 'sports-pathways', 'مسارات رياضية', 'Sports Pathways', 'الوظائف والمسارات المهنية داخل القطاع الرياضي.', 'Jobs and career pathways within the sports sector.', 'برنامج متخصص في الوظائف والمسارات المهنية داخل القطاع الرياضي. كل موضوع يشرح وظيفة محددة من حيث أهدافها، مهامها اليومية، المهارات المطلوبة، التخصصات المناسبة، الشهادات أو الرخص المحتملة، وطريق الدخول إليها.', 'A program specializing in jobs and career pathways within the sports sector. Each topic explains a specific role: its goals, daily tasks, required skills, suitable specializations, potential certificates or licenses, and how to enter the field.', '', '#5ac8b0', 9, true),
  ('prog10', 'best-version', 'النسخة الأفضل', 'The Best Version', 'تطوير اللاعب من جميع الجوانب للاقتراب من أفضل نسخة ممكنة.', 'Developing the player from all angles to approach the best possible version.', 'برنامج يركز على تطوير اللاعب من جميع الجوانب: مهاريًا، بدنيًا، تكتيكيًا، ذهنيًا، نفسيًا، اجتماعيًا، وسلوكيًا، بهدف الاقتراب من أفضل نسخة ممكنة داخل الملعب وخارجه.', 'A program focusing on developing the player from all angles: skill, physical, tactical, mental, psychological, social, and behavioral — aiming to approach the best possible version on and off the pitch.', '', '#7ec85a', 10, true)
on conflict (id) do update set
  slug = excluded.slug,
  name_ar = excluded.name_ar,
  name_en = excluded.name_en,
  short_description_ar = excluded.short_description_ar,
  short_description_en = excluded.short_description_en,
  description_ar = excluded.description_ar,
  description_en = excluded.description_en,
  logo_url = excluded.logo_url,
  accent_color = excluded.accent_color,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.categories (id, name_ar, name_en, sort_order)
values
  ('cat1', 'علم الكشف', 'Talent Science', 1),
  ('cat2', 'نماذج التطوير', 'Development Models', 2),
  ('cat3', 'التحليل والتقييم', 'Analysis & Assessment', 3),
  ('cat4', 'الكشافة الميدانية', 'Field Scouting', 4)
on conflict (id) do update set
  name_ar = excluded.name_ar,
  name_en = excluded.name_en,
  sort_order = excluded.sort_order;

insert into public.tags (id, name, slug)
values
  ('tag1', 'اكتشاف المواهب', 'talent-identification'),
  ('tag2', 'تطوير اللاعبين', 'player-development'),
  ('tag3', 'الفئات السنية', 'youth-categories'),
  ('tag4', 'الأكاديميات', 'academies'),
  ('tag5', 'Scouting', 'scouting'),
  ('tag6', 'تحليل الأداء', 'performance-analysis'),
  ('tag7', 'اللياقة البدنية', 'fitness'),
  ('tag8', 'علم النفس الرياضي', 'sports-psychology'),
  ('tag9', 'النضج البيولوجي', 'bio-banding'),
  ('tag10', 'التغذية', 'nutrition'),
  ('tag11', 'النمو والتطور', 'growth-development'),
  ('tag12', 'البيانات والإحصائيات', 'data-stats'),
  ('tag13', 'إدارة رياضية', 'sports-management'),
  ('tag14', 'فلسفة اللعب', 'playing-philosophy'),
  ('tag15', 'ثقافة كروية', 'football-culture'),
  ('tag16', 'إصابات ووقاية', 'injuries-prevention'),
  ('tag17', 'مهارات فنية', 'technical-skills'),
  ('tag18', 'ذكاء تكتيكي', 'tactical-intelligence'),
  ('tag19', 'بيئة اللاعب', 'player-environment'),
  ('tag20', 'ولي الأمر', 'parents'),
  ('tag21', 'المدرب', 'coach'),
  ('tag22', 'الكشاف', 'scout'),
  ('tag23', 'اللاعب الصغير', 'young-player'),
  ('tag24', 'Talent Pathway', 'talent-pathway'),
  ('tag25', 'Bio-Banding', 'bio-banding-model'),
  ('tag26', 'TIPS', 'tips-model'),
  ('tag27', 'GPS', 'gps'),
  ('tag28', 'xG', 'xg'),
  ('tag29', 'DMSP', 'dmsp'),
  ('tag30', 'نماذج عالمية', 'global-models')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug;

insert into public.articles (id, slug, title_ar, title_en, excerpt_ar, excerpt_en, content_ar, content_en, image, date, category_id, category_ar, category_en, program_id, tag_ids, featured, is_new, is_published, reading_time, level, sources, youtube_url, video_url)
values
  ('a1', 'talent-identification-basics', 'أسس اكتشاف المواهب في كرة القدم الحديثة', 'Fundamentals of Football Talent Identification', 'يُعدّ اكتشاف المواهب ركيزةً أساسيةً في بناء كرة القدم الحديثة، إذ يتجاوز مجرد رصد الموهبة الخام إلى فهم عميق للمؤشرات البيولوجية والنفسية والتقنية التي تميز اللاعب الاستثنائي.', 'Talent identification is a cornerstone of modern football, going beyond raw talent spotting to a deep understanding of biological, psychological, and technical indicators.', '<h2>مقدمة في علم الكشف</h2><p>يُعدّ اكتشاف المواهب ركيزةً أساسيةً في بناء كرة القدم الحديثة. لم يعد الأمر مقتصراً على رصد اللاعب الذي يتألق في ملعب الحي، بل تحوّل إلى علم منهجي دقيق يجمع بين الأدوات الكمية والنوعية.</p><h2>المؤشرات الأساسية للموهبة</h2><p>تشمل المؤشرات التي يرصدها الكشافون المحترفون: القدرات البدنية كالسرعة والمرونة، والمهارات التقنية كالتحكم بالكرة والتمرير، فضلاً عن الذكاء التكتيكي والثبات النفسي تحت الضغط.</p><blockquote>الموهبة الحقيقية لا تُرى فحسب، بل تُقاس وتُحلَّل وتُطوَّر بمنهجية علمية صارمة.</blockquote><h2>دور السياق في الكشف</h2><p>من أبرز ما توصل إليه الباحثون أن الموهبة ليست ثابتة؛ فاللاعب الذي يظهر في سياق تدريبي ضعيف قد يبدو أقل إمكانات من نظيره المحظوظ ببيئة أفضل. لذا يُركز الكشاف الحديث على قابلية التطوير لا الأداء الآني فحسب.</p>', '<h2>Introduction to Talent Science</h2><p>Talent identification has become a cornerstone of modern football. It''s no longer just about spotting a kid lighting up a local pitch — it''s evolved into a systematic science combining quantitative and qualitative tools.</p><h2>Core Talent Indicators</h2><p>Professional scouts look for physical capacities like speed and agility, technical skills like ball control and passing, as well as tactical intelligence and psychological resilience under pressure.</p><blockquote>True talent is not just seen — it is measured, analyzed, and developed with rigorous scientific methodology.</blockquote><h2>The Role of Context</h2><p>Researchers have found that talent is not fixed. A player appearing in a poor training environment may seem less capable than one lucky enough to be in a better setup. Modern scouts focus on developmental potential, not just current performance.</p>', '', '2024-12-01', 'cat1', 'علم الكشف', 'Talent Science', 'prog3', array['tag1','tag2','tag5','tag23']::text[], true, false, true, null, null, '[{"title":"Talent Identification and Development in Sport (Vaeyens et al.)","url":"","type":"study","accessed":""},{"title":"FIFA Talent Development Programme","url":"https://www.fifa.com","type":"official","accessed":"2024-11-01"}]'::jsonb, '', ''),
  ('a2', 'dmsp-model', 'نموذج DMSP وتطبيقاته في تطوير اللاعبين الشباب', 'The DMSP Model and Its Applications in Youth Player Development', 'نموذج التطوير الرياضي متعدد المسارات (DMSP) من أبرز الأطر العلمية الحديثة التي تُعيد تشكيل فهمنا لمسيرة اللاعب من طفولته حتى الاحتراف.', 'The Developmental Model of Sport Participation (DMSP) is one of the most prominent modern frameworks reshaping our understanding of a player''s journey from childhood to professionalism.', '<h2>نموذج DMSP</h2><p>طوّر الباحث جان كوتيه هذا النموذج الذي يُقسّم المسيرة الرياضية إلى مراحل متتالية: مرحلة التجريب في سن مبكرة، ثم مرحلة التخصص، وصولاً إلى مرحلة الاستثمار الكامل للموهبة.</p><h2>مراحل النموذج</h2><p>تبدأ المرحلة الأولى (التجريب) بين سن 6-12 سنة، حيث يُشجَّع الطفل على ممارسة رياضات متعددة دون تخصص مبكر. تليها مرحلة التخصص (13-15 سنة) حيث تبدأ الاهتمامات بالتبلور. أخيراً مرحلة الاستثمار (16+ سنة) حيث يتفرغ اللاعب للرياضة الواحدة.</p><h2>التطبيق في كرة القدم</h2><p>تبنّت أكاديميات عديدة في أوروبا هذا النموذج، وأثبتت الدراسات أن اللاعبين الذين مرّوا بمرحلة تجريب صحيحة كانوا أكثر إبداعاً وقدرةً على التكيف في مراحل لاحقة.</p>', '<h2>The DMSP Framework</h2><p>Developed by researcher Jean Côté, this model divides the athletic career into successive stages: an early sampling phase, a specializing phase, and finally an investment phase.</p><h2>Model Stages</h2><p>The first stage (Sampling) spans ages 6-12, where children are encouraged to try multiple sports without early specialization. Next comes Specializing (ages 13-15) where interests begin to crystallize. Finally, the Investment phase (16+) where the player commits fully to one sport.</p><h2>Application in Football</h2><p>Many European academies have adopted this model, and studies show that players who experienced a proper sampling period were more creative and adaptable in later stages.</p>', '', '2024-11-15', 'cat2', 'نماذج التطوير', 'Development Models', 'prog4', array['tag2','tag3','tag29','tag30','tag24']::text[], true, false, true, null, null, '[{"title":"A Developmental Model of Sport Participation (Côté, 1999)","url":"","type":"study","accessed":""}]'::jsonb, '', ''),
  ('a3', 'scouting-report-writing', 'كيف تكتب تقرير كشف احترافي — دليل عملي شامل', 'How to Write a Professional Scouting Report — A Practical Guide', 'التقرير الكشفي الاحترافي هو لغة التواصل بين الكشاف والإدارة الفنية. في هذا المقال نستعرض مكوناته الأساسية ومنهجية كتابته بشكل علمي ودقيق.', 'The professional scouting report is the language of communication between the scout and technical management. This article reviews its core components and the methodology for writing it scientifically.', '<h2>ما هو التقرير الكشفي؟</h2><p>التقرير الكشفي وثيقة منهجية تُلخّص مشاهدة الكشاف للاعب في سياق تنافسي أو تدريبي، وتُقدّم تقييماً موضوعياً لمستواه الراهن وإمكاناته المستقبلية.</p><h2>الأقسام الأساسية</h2><p>يشمل التقرير الاحترافي: البيانات الشخصية للاعب، المعطيات التقنية والتكتيكية، التقييم البدني، المعطيات النفسية والسلوكية، وأخيراً التوصية النهائية.</p><h2>أخطاء شائعة يجب تجنبها</h2><p>من أبرز الأخطاء: الاعتماد الكلي على مباراة واحدة، الخلط بين الأداء الآني وإمكانات التطوير، وإغفال التأثير السياقي كجودة الخصم وظروف الملعب.</p>', '<h2>What Is a Scouting Report?</h2><p>A scouting report is a systematic document that summarizes the scout''s observation of a player in a competitive or training context, providing an objective assessment of current level and future potential.</p><h2>Core Sections</h2><p>A professional report includes: player personal data, technical and tactical metrics, physical assessment, psychological and behavioral observations, and a final recommendation.</p><h2>Common Mistakes to Avoid</h2><p>Key mistakes include: relying entirely on a single match, confusing current performance with developmental potential, and ignoring contextual factors like opponent quality and pitch conditions.</p>', '', '2024-10-20', 'cat4', 'الكشافة الميدانية', 'Field Scouting', 'prog6', array['tag5','tag22','tag6','tag1']::text[], false, false, true, null, null, '[]'::jsonb, '', '')
on conflict (id) do update set
  slug = excluded.slug,
  title_ar = excluded.title_ar,
  title_en = excluded.title_en,
  excerpt_ar = excluded.excerpt_ar,
  excerpt_en = excluded.excerpt_en,
  content_ar = excluded.content_ar,
  content_en = excluded.content_en,
  image = excluded.image,
  date = excluded.date,
  category_id = excluded.category_id,
  category_ar = excluded.category_ar,
  category_en = excluded.category_en,
  program_id = excluded.program_id,
  tag_ids = excluded.tag_ids,
  featured = excluded.featured,
  is_new = excluded.is_new,
  is_published = excluded.is_published,
  reading_time = excluded.reading_time,
  level = excluded.level,
  sources = excluded.sources,
  youtube_url = excluded.youtube_url,
  video_url = excluded.video_url;

insert into public.books (id, title_ar, title_en, subtitle_ar, subtitle_en, description_ar, description_en, cover, amazon_url, price, available)
values
  ('b1', 'صراع المواهب', 'The Talent Struggle', 'دليل شامل في اكتشاف وتطوير المواهب الكروية', 'A Comprehensive Guide to Football Talent Identification & Development', 'مرجع أكاديمي وعملي متكامل يغطي مسيرة المواهب الكروية من الناشئين حتى الاحتراف، مبني على أحدث الأطر العلمية العالمية كـ DMSP وLTAD وFTEM، ويجمع بين التحليل النظري والتطبيق الميداني الحقيقي.', 'A comprehensive academic and practical reference covering football talent journeys from youth to professional level, built on the latest global scientific frameworks including DMSP, LTAD, and FTEM, combining theoretical analysis with real field application.', '', 'https://www.amazon.com', '99 SAR', true)
on conflict (id) do update set
  title_ar = excluded.title_ar,
  title_en = excluded.title_en,
  subtitle_ar = excluded.subtitle_ar,
  subtitle_en = excluded.subtitle_en,
  description_ar = excluded.description_ar,
  description_en = excluded.description_en,
  cover = excluded.cover,
  amazon_url = excluded.amazon_url,
  price = excluded.price,
  available = excluded.available;

insert into public.resources (id, slug, type, document_subtype, title_ar, title_en, short_description_ar, short_description_en, full_description_ar, full_description_en, bajo_summary_ar, why_it_matters_ar, target_audience, field, language, author_or_org, publisher, publication_year, pages, file_size, cover_image, source_url, download_url, access_type, rights, tags, is_featured, is_published)
values
  ('r1', 'fifa-talent-identification-framework', 'official_document', 'practical_guide', 'كشف المواهب في كرة القدم — إطار FIFA العلمي', 'Talent Identification in Football — FIFA Scientific Framework', 'وثيقة رسمية من FIFA تستعرض الأُطر العلمية لكشف المواهب الكروية وتطويرها، وتقدم توصيات عملية للأكاديميات والمدربين والكشافين.', 'Official FIFA document outlining scientific frameworks for football talent identification and development with practical recommendations.', 'تقدم هذه الوثيقة مراجعة شاملة لأساليب كشف المواهب المعتمدة علميًا، مع التركيز على نماذج LTAD وFTEM ومؤشرات التنبؤ بالإمكانات الكروية.', 'This document provides a comprehensive review of scientifically validated talent identification methods, focusing on LTAD and FTEM models.', 'يعتمد على أحدث الأطر العلمية في مجال المواهب,يقدم مؤشرات قابلة للتطبيق الميداني,مناسب لبناء برامج أكاديمية متكاملة', 'مصدر موثوق من الاتحاد الدولي,يساعد على توحيد معايير التقييم', 'coach,scout,academy', 'talent_identification,player_development', 'en', 'FIFA', 'FIFA — Fédération Internationale de Football Association', 2023, 64, '4.2 MB', '', 'https://www.fifa.com', null, 'external_link', 'official_publication', array['FIFA','talent','LTAD','FTEM']::text[], true, true),
  ('r2', 'bio-banding-youth-player-development', 'scientific_study', null, 'Bio-Banding في تطوير اللاعبين الشباب', 'Bio-Banding in Youth Player Development', 'دراسة علمية محكّمة تناقش تأثير التجميع حسب النضج البيولوجي بدلاً من العمر الزمني على تطوير اللاعبين الشباب وتحسين دقة كشف المواهب.', 'Peer-reviewed study examining the impact of grouping youth players by biological maturity rather than chronological age.', 'تستعرض الدراسة أدلة علمية على أن التجميع حسب النضج البيولوجي يقلل من تحيز تأثير الشهر النسبي ويعطي اللاعبين المتأخرين نضجًا فرصة أعادل.', 'The study presents evidence that bio-banding grouping reduces relative age effect bias and gives late-maturing players fairer development opportunities.', 'يشرح ظاهرة تأثير الشهر النسبي بعمق,يقدم حلاً عمليًا لإصلاح نظام الأكاديميات,مبني على بيانات من أكاديميات أوروبية كبرى', 'كثير من المواهب الحقيقية تضيع بسبب التأخر في النضج,تطبيق Bio-Banding بدأ في أكاديميات إنجلترا وأوروبا', 'coach,scout,academy,researcher', 'talent_identification,player_development,sports_science', 'en', 'Sean Cumming et al.', 'Journal of Sports Sciences', 2017, 12, '1.1 MB', '', 'https://www.tandfonline.com', null, 'external_link', 'source_link_only', array['bio-banding','maturity','relative-age','youth']::text[], true, true),
  ('r3', 'football-scout-report-template', 'template', null, 'قالب تقرير كشاف كرة القدم', 'Football Scout Report Template', 'قالب جاهز للاستخدام لتقرير الكشاف يغطي جميع جوانب تقييم اللاعب: التقني، التكتيكي، البدني، والنفسي، مع مقياس تقييم واضح.', 'Ready-to-use scout report template covering all aspects of player assessment: technical, tactical, physical, and psychological.', 'قالب مبني على معايير التقييم المعتمدة في الأكاديميات الاحترافية، يمكن تكييفه لأي فئة عمرية أو مستوى تنافسي.', 'Template built on evaluation criteria used in professional academies, adaptable to any age group or competitive level.', 'يغطي أربعة محاور تقييم أساسية,يتضمن مقياسًا رقميًا واضحًا,قابل للتعديل والطباعة', 'يضع أساسًا موحدًا لتقارير الكشف,يسهل المقارنة بين اللاعبين عبر الزمن', 'scout,coach', 'talent_identification,scouting', 'ar', 'BajoZone', 'باجو زون', 2025, 2, '0.3 MB', '', '', '', 'direct_download', 'free', array['template','scout','report','assessment']::text[], true, true),
  ('r4', 'parent-guide-football-academy', 'practical_guide', null, 'دليل ولي الأمر في بيئة الأكاديمية الكروية', 'Parent Guide in Football Academy Environment', 'دليل عملي يساعد أولياء الأمور على فهم دورهم الصحيح في مسيرة أبنائهم الكروية، ويوضح كيف يدعمون دون أن يضغطوا.', 'Practical guide helping parents understand their correct role in their children''s football journey.', 'يستعرض الدليل أبحاث علم النفس الرياضي المتعلقة بدور الأسرة، مع نصائح عملية لكيفية التواصل مع المدربين ودعم الطفل نفسيًا.', 'Covers sports psychology research on the family''s role, with practical tips on communicating with coaches and providing psychological support.', 'يميز بين الدعم الإيجابي والضغط السلبي,مبني على أبحاث علم النفس الرياضي,يتضمن أسئلة شائعة من أولياء الأمور', 'ولي الأمر شريك رئيسي في تطوير اللاعب,الضغط الأسري أحد أسباب ترك كرة القدم مبكرًا', 'parent', 'player_development,sports_psychology,parent', 'ar', 'BajoZone', 'باجو زون', 2025, 8, '0.8 MB', '', '', '', 'direct_download', 'free', array['parent','psychology','academy','support']::text[], false, true)
on conflict (id) do update set
  slug = excluded.slug,
  type = excluded.type,
  document_subtype = excluded.document_subtype,
  title_ar = excluded.title_ar,
  title_en = excluded.title_en,
  short_description_ar = excluded.short_description_ar,
  short_description_en = excluded.short_description_en,
  full_description_ar = excluded.full_description_ar,
  full_description_en = excluded.full_description_en,
  bajo_summary_ar = excluded.bajo_summary_ar,
  why_it_matters_ar = excluded.why_it_matters_ar,
  target_audience = excluded.target_audience,
  field = excluded.field,
  language = excluded.language,
  author_or_org = excluded.author_or_org,
  publisher = excluded.publisher,
  publication_year = excluded.publication_year,
  pages = excluded.pages,
  file_size = excluded.file_size,
  cover_image = excluded.cover_image,
  source_url = excluded.source_url,
  download_url = excluded.download_url,
  access_type = excluded.access_type,
  rights = excluded.rights,
  tags = excluded.tags,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published;

commit;
