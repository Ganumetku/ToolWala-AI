/**
 * Complete humanized localized tool articles for priority tools in Spanish, Portuguese, and Hindi.
 * Adheres to AGENTS.md standards: natural flow, conversational tone, zero AI clichés, ~80-100 words per section.
 */

export interface LocalizedArticleData {
  title: string;
  intro: string;
  whatHeading?: string;
  whatItDoes?: string;
  howToHeading?: string;
  howToUse?: string[];
  keyFeatures?: { title: string; desc: string }[];
  benefits?: string[];
  whyChooseHeading?: string;
  whyChoose?: string;
  useCasesHeading?: string;
  useCases?: string[];
  faqs?: { question: string; answer: string }[];
  conclusionHeading?: string;
  conclusion?: string;
}

export const LOCALIZED_TOOL_ARTICLES: Record<string, Record<string, LocalizedArticleData>> = {
  // ==========================================
  // JPG TO PDF
  // ==========================================
  'jpg-to-pdf': {
    es: {
      title: 'Convertir JPG a PDF Gratis – 100% en tu Navegador',
      intro: 'Convierte fotos, recibos o escaneos en un único documento PDF al instante. Todo se procesa aquí mismo en tu navegador, sin subir nada a servidores externos.',
      whatHeading: 'Cómo funciona la conversión local',
      whatItDoes: 'Tomas una foto de un formulario, una factura o tu documento de identidad y el trámite te pide un PDF. Esta herramienta une esas imágenes en segundos directamente en tu pestaña.\n\nTus fotos nunca viajan por internet ni se guardan en la nube: al cerrar la pestaña desaparecen por completo. Puedes reordenar las páginas, girar fotos torcidas y elegir el tamaño adecuado (A4 o Carta) antes de descargar.',
      howToHeading: 'Pasos para convertir imágenes a PDF',
      howToUse: [
        'Arrastra tus imágenes JPG, PNG o WebP a la zona de carga o pulsa en Elegir imágenes.',
        'Revisa las miniaturas: ese será el orden exacto de las páginas en el PDF final.',
        'Mueve cualquier tarjeta arriba o abajo para ordenar, o gira 90° las fotos que hayan salido de lado.',
        'Elige el tamaño de página (A4, Carta o Ajustar a imagen) y la orientación deseada.',
        'Ponle nombre al archivo y pulsa Convertir a PDF para descargarlo al instante.'
      ],
      keyFeatures: [
        { title: 'Privacidad absoluta', desc: 'La conversión se hace en tu propio procesador. Nadie más ve ni almacena tus archivos personales.' },
        { title: 'Tamaño y margen a tu gusto', desc: 'Elige A4, Carta o ajuste automático con orientación vertical u horizontal y márgenes limpios.' },
        { title: 'Reordena y gira antes de convertir', desc: 'Corrige el orden y la orientación de cada foto con un simple clic antes de generar el documento.' },
        { title: 'Sin registros ni marcas de agua', desc: 'Descarga directa sin introducir correo electrónico ni límites ocultos de uso.' }
      ],
      benefits: [
        'Tus documentos privados y recibos nunca salen de tu ordenador o teléfono.',
        '100% gratuito, sin marcas de agua ni suscripciones obligatorias.',
        'Control total del orden y rotación de páginas.',
        'Funciona con total rapidez en cualquier navegador moderno sin instalar nada.'
      ],
      whyChooseHeading: 'Por qué usar este conversor en lugar de otros',
      whyChoose: 'La mayoría de convertidores gratuitos te piden subir archivos a sus servidores o limitan las conversiones diarias para obligarte a pagar. Aquí no hay trampas: todo el trabajo pesado lo hace tu navegador de forma limpia, privada y sin perder nitidez.',
      useCasesHeading: 'Casos habituales de uso',
      useCases: [
        'Juntar fotos de facturas o tickets de gastos para la empresa o la declaración.',
        'Unir el anverso y reverso del documento de identidad en un solo PDF oficial.',
        'Convertir fotos de apuntes, ejercicios o tareas universitarias en un único archivo.',
        'Enviar portfolios fotográficos en un PDF ligero y profesional.'
      ],
      faqs: [
        { question: '¿Es seguro convertir fotos de documentos privados o identificaciones?', answer: 'Totalmente. Tus imágenes no se envían a ningún servidor remoto. El PDF se ensambla dentro de la memoria de tu navegador, por lo que nadie más tiene acceso a tus fotos.' },
        { question: '¿Qué formatos de imagen puedo subir?', answer: 'Puedes usar fotos en JPG, JPEG, PNG y WebP, e incluso mezclar formatos en el mismo PDF.' },
        { question: '¿Puedo cambiar el orden de las fotos?', answer: 'Sí. Cada foto aparece como una tarjeta interactiva con flechas para subir, bajar o girar 90 grados según necesites.' },
        { question: '¿Se reduce la calidad de las imágenes?', answer: 'El conversor respeta la nitidez original de tus imágenes. Si luego necesitas un tamaño exacto (como menos de 300KB), puedes pasarlo por nuestra herramienta Comprimir PDF.' }
      ],
      conclusionHeading: 'Listo para descargar',
      conclusion: 'Añade las fotos, revisa el orden y descarga tu PDF en un par de clics. Fácil, rápido y con la tranquilidad de que nada sale de tu dispositivo.'
    },
    pt: {
      title: 'Converter JPG para PDF Grátis – 100% no Navegador',
      intro: 'Transforme fotos, recibos ou documentos escaneados em um único arquivo PDF na hora. Nada é enviado para a nuvem: o processamento roda direto no seu aparelho.',
      whatHeading: 'Como funciona a conversão local',
      whatItDoes: 'Você tira fotos de um formulário, de um comprovante ou do RG e o site exige um único PDF anexado. Essa ferramenta resolve o problema em segundos.\n\nO PDF é montado na memória do seu navegador. Suas fotos não são enviadas para nenhum servidor externo e somem assim que você fecha a página. Dá para organizar a ordem das páginas, girar fotos de lado e selecionar folha A4 ou Carta antes de salvar.',
      howToHeading: 'Passo a passo para gerar seu PDF',
      howToUse: [
        'Arraste suas fotos em JPG, PNG ou WebP para a área indicada ou clique em Escolher imagens.',
        'Confira a sequência das miniaturas — essa será a ordem das páginas no PDF.',
        'Use as setas para reposicionar as imagens ou gire as que saíram deitadas.',
        'Defina o tamanho da folha (A4, Carta ou Ajuste livre) e a orientação.',
        'Clique em Converter para PDF e baixe seu documento pronto imediatamente.'
      ],
      keyFeatures: [
        { title: 'Seus arquivos não saem daqui', desc: 'A montagem do PDF acontece no seu navegador. Ninguém tem acesso aos seus dados pessoais.' },
        { title: 'Controle total de páginas', desc: 'Alterne a ordem e gire fotos na horizontal ou vertical antes de gerar o arquivo final.' },
        { title: 'Formatos flexíveis', desc: 'Escolha folhas padrão A4, Carta ou formato sob medida com margens limpas.' },
        { title: 'Sem cadastro ou marcas', desc: 'Uso 100% gratuito sem marcas d\'água no documento e sem pedir seu e-mail.' }
      ],
      benefits: [
        'Comprovantes e documentos sigilosos ficam salvos apenas no seu aparelho.',
        'Sem limites artificiais de uso diário nem cadastros demorados.',
        'Gire fotos invertidas e ajuste a ordem das páginas livremente.',
        'Funciona liso no celular, no tablet ou no computador.'
      ],
      whyChooseHeading: 'Por que escolher este conversor',
      whyChoose: 'Muitos serviços online exigem upload em nuvens terceiras ou colocam marcas d\'água no PDF final. O ToolWala faz tudo direto no seu navegador: você mantém a nitidez das fotos e a sua privacidade intacta.',
      useCasesHeading: 'Onde as pessoas mais usam',
      useCases: [
        'Juntar fotos de notas fiscais e recibos para reembolso de despesas corporativas.',
        'Combinar frente e verso do RG ou CNH em um documento único para cadastros.',
        'Organizar páginas de apostilas, anotações de aula ou trabalhos acadêmicos.',
        'Montar apresentações ou portfólios visuais simples em PDF.'
      ],
      faqs: [
        { question: 'É seguro juntar fotos de documentos e dados pessoais aqui?', answer: 'Sim, com total segurança. O código roda localmente na memória do seu navegador, sem envio para servidores externos. Ao fechar a aba, tudo é apagado.' },
        { question: 'Quais tipos de imagens são aceitos?', answer: 'Você pode usar arquivos JPG, JPEG, PNG e WebP, inclusive combinando formatos diferentes no mesmo PDF.' },
        { question: 'Consigo girar imagens que foram tiradas de lado?', answer: 'Sim. Basta clicar no botão de girar na miniatura da imagem para rotacionar 90 graus até acertar a orientação.' },
        { question: 'O conversor diminui a qualidade das fotos?', answer: 'A nitidez original é preservada. Se o portal de destino exigir um peso máximo pequeno (como 500KB), basta usar o nosso Compressor de PDF logo após a conversão.' }
      ],
      conclusionHeading: 'Pronto e seguro',
      conclusion: 'Selecione as imagens, ajuste a ordem e baixe seu PDF em segundos. Simples, confiável e com privacidade garantida.'
    },
    hi: {
      title: 'JPG से PDF कन्वर्टर – बिना अपलोड, 100% सुरक्षित',
      intro: 'अपनी फ़ोटो, रसीदें या दस्तावेज़ स्कैन को तुरंत एक PDF में बदलें। फ़ाइलें आपके डिवाइस पर ही प्रोसेस होती हैं — सर्वर पर कुछ भी अपलोड नहीं होता।',
      whatHeading: 'यह टूल कैसे काम करता है',
      whatItDoes: 'जब भी किसी सरकारी पोर्टल, नौकरी के फॉर्म या कॉलेज एडमिशन में कई फ़ोटो की जगह एक सिंगल PDF मांगी जाती है, यह टूल काम आता है।\n\nयह पूरा काम आपके ब्राउज़र में ही करता है। आपकी निजी तस्वीरें इंटरनेट पर कहीं भी सेव नहीं होतीं। टैब बंद करते ही सब कुछ साफ। आप फ़ोटो का क्रम बदल सकते हैं, आड़ी-तिरछी फ़ोटो को सीधा कर सकते हैं और A4 या लेटर साइज चुनकर तुरंत PDF डाउनलोड कर सकते हैं।',
      howToHeading: 'JPG से PDF बनाने के आसान स्टेप्स',
      howToUse: [
        'अपनी JPG, PNG या WebP फ़ाइलें यहाँ ड्रैग करें या इमेज चुनें पर क्लिक करें।',
        'नीचे दिखने वाले थंबनेल चेक करें — यही आपकी PDF का पेज क्रम होगा।',
        'ऊपर-नीचे तीरों से फ़ोटो का क्रम बदलें और जो फ़ोटो उल्टी है उसे 90° घुमाकर सीधा करें।',
        'A4, लेटर या ऑटो साइज और पोर्ट्रेट/लैंडस्केप ओरिएंटेशन चुनें।',
        'फ़ाइल का नाम दर्ज करें और Convert to PDF दबाकर तुरंत डाउनलोड करें।'
      ],
      keyFeatures: [
        { title: 'डिवाइस पर ही प्रोसेस', desc: 'PDF सीधे आपके ब्राउज़र में बनती है। आपकी तस्वीरें किसी सर्वर पर नहीं भेजी जातीं।' },
        { title: 'पेज साइज और मार्जिन', desc: 'A4, लेटर या इमेज के आकार अनुसार पेज चुनें। जरूरत हो तो मार्जिन भी जोड़ें।' },
        { title: 'क्रम और रोटेशन सेट करें', desc: 'कन्वर्ट करने से पहले हर फ़ोटो को सीधा करें और सही क्रम में लगाएं।' },
        { title: 'कोई वॉटरमार्क या साइनअप नहीं', desc: 'बिना किसी ईमेल या रजिस्ट्रेशन के पूरी तरह मुफ्त और साफ PDF पाएं।' }
      ],
      benefits: [
        'आधार, पैन या बैंक रसीद जैसी निजी तस्वीरें कभी डिवाइस से बाहर नहीं जातीं।',
        'कोई वॉटरमार्क नहीं और न ही कोई दैनिक डाउनलोड सीमा।',
        'मोबाइल और लैपटॉप दोनों पर बहुत तेजी से काम करता है।',
        'इंटरनेट कनेक्शन धीमा होने पर भी तुरंत प्रोसेस करता है।'
      ],
      whyChooseHeading: 'टूलवाला का यह कन्वर्टर क्यों बेहतर है',
      whyChoose: 'ज़्यादातर ऑनलाइन कन्वर्टर आपकी फ़ाइलों को पहले अपने सर्वर पर अपलोड करवाते हैं और फिर वॉटरमार्क हटाने के पैसे मांगते हैं। टूलवाला में ऐसा कुछ नहीं है — यह सीधे आपके ब्राउज़र में सुरक्षित और तेज़ गति से काम करता है।',
      useCasesHeading: 'लोग इसका उपयोग कहाँ करते हैं',
      useCases: [
        'ऑफिस बिल, रसीदें और इनवॉइस एक PDF में जोड़कर जमा करने के लिए।',
        'आईडी प्रूफ (आधार या पैन) का आगे-पीछे का फोटो एक दस्तावेज़ में बदलने के लिए।',
        'क्लास नोट्स, असाइनमेंट या प्रोजेक्ट के फोटो क्रमवार PDF बनाने के लिए।',
        'सरकारी फॉर्म और परीक्षा पोर्टल्स पर जरूरी डॉक्यूमेंट्स अपलोड करने के लिए।'
      ],
      faqs: [
        { question: 'क्या यहाँ अपनी आईडी या निजी फोटो कन्वर्ट करना सुरक्षित है?', answer: 'हाँ, पूरी तरह सुरक्षित। आपकी तस्वीरें कभी हमारे सर्वर पर नहीं जातीं। सारा काम ब्राउज़र मेमोरी में होता है और टैब बंद करते ही सब नष्ट हो जाता है।' },
        { question: 'कौन-कौन से इमेज फॉर्मेट स्वीकार किए जाते हैं?', answer: 'आप JPG, JPEG, PNG और WebP फ़ाइलें अपलोड कर सकते हैं और इन्हें एक ही PDF में मिला सकते हैं।' },
        { question: 'क्या उल्टी या आड़ी फ़ोटो को सीधा किया जा सकता है?', answer: 'हाँ, हर इमेज कार्ड पर रोटेट का बटन है जिससे आप 90 डिग्री घुमाकर फ़ोटो को सही दिशा में कर सकते हैं।' },
        { question: 'क्या यह टूल फ़ोटो की क्वालिटी कम करता है?', answer: 'नहीं, यह मूल स्पष्टता बनाए रखता है। अगर आपको किसी पोर्टल के लिए तय सीमा (जैसे 300KB) चाहिए, तो इसके बाद हमारे PDF कंप्रेसर का इस्तेमाल करें।' }
      ],
      conclusionHeading: 'बस कुछ ही सेकंड में तैयार',
      conclusion: 'फ़ोटो डालें, क्रम चेक करें और अपनी PDF डाउनलोड करें। बिना झंझट और पूरी प्राइवेसी के साथ।'
    }
  },

  // ==========================================
  // IMAGE COMPRESSOR
  // ==========================================
  'image-compressor': {
    es: {
      title: 'Compresor de Imágenes Online – Reduce JPG sin Perder Calidad',
      intro: 'Las imágenes pesadas ralentizan las páginas web y son rechazadas en los portales oficiales. Reduce tus fotos hasta un 80% manteniendo una nitidez impecable.',
      whatHeading: 'Reducción de tamaño directa en tu navegador',
      whatItDoes: 'Las fotos tomadas con el móvil suelen pesar varios megabytes innecesarios. Este optimizador elimina metadatos ocultos y comprime los bloques de color en tu propio dispositivo.\n\nAl no transferir los archivos a servidores externos, el proceso es instantáneo y seguro. Obtienes archivos ligeros en JPG o WebP listos para enviar por correo o subir a trámites con límites estrictos de tamaño.',
      howToHeading: 'Cómo comprimir tus imágenes',
      howToUse: [
        'Arrastra una o varias imágenes al recuadro o haz clic para buscarlas en tu equipo.',
        'Ajusta la barra de calidad o elige un ajuste preestablecido (como 50KB o 100KB).',
        'Comprueba el contador en vivo para ver exactamente cuántos kilobytes has ahorrado.',
        'Descarga tus imágenes optimizadas de una en una o todas juntas en un archivo zip.'
      ],
      keyFeatures: [
        { title: 'Procesamiento en tu equipo', desc: 'Sin envíos a nubes externas: la compresión utiliza la potencia de tu propio procesador.' },
        { title: 'Comprime por lotes', desc: 'Arrastra varias fotos a la vez y redúcelas todas en una sola pasada.' },
        { title: 'Comparador en directo', desc: 'Revisa el peso antes y después con una vista previa de la calidad visual.' },
        { title: 'Compatibilidad con WebP', desc: 'Opción para convertir imágenes pesadas al moderno y ligero formato WebP.' }
      ],
      benefits: [
        'Cumple fácilmente los requisitos de tamaño en portales de empleo, visados y universidades.',
        'Acelera la carga de tu sitio web y ahorra ancho de banda.',
        'Libera espacio valioso en la memoria de tu móvil u ordenador.'
      ],
      whyChooseHeading: 'Por qué comprimir con ToolWala',
      whyChoose: 'Muchos servicios imponen límites diarios de dos fotos o comprimen tanto que las imágenes parecen borrosas. Aquí tienes una herramienta rápida, honesta y sin registros para comprimir cuanto necesites.',
      useCasesHeading: 'Usos más comunes',
      useCases: [
        'Subir fotos de carnet o firma a formularios de oposiciones y bolsas de empleo.',
        'Optimizar fotos para blogs y tiendas online sin ralentizar la navegación.',
        'Enviar documentos adjuntos por correo sin superar el límite de tamaño.'
      ],
      faqs: [
        { question: '¿Cómo comprimir sin que la imagen se vea borrosa?', answer: 'Mantén el nivel de calidad entre el 70% y el 80%. Suele reducir más del 65% del tamaño sin diferencias apreciables a simple vista.' },
        { question: '¿Funciona sin conexión a internet?', answer: 'Sí. Una vez cargada la página, todo el motor de compresión corre directamente en la pestaña de tu navegador.' },
        { question: '¿Se mantiene la transparencia en archivos PNG?', answer: 'Sí, las zonas transparentes se conservan intactas mientras se optimiza el peso total del archivo.' }
      ],
      conclusionHeading: 'Ligero y listo',
      conclusion: 'No dejes que imágenes gigantescas retrasen tus trámites. Ajusta el tamaño en segundos y sigue adelante sin complicaciones.'
    },
    pt: {
      title: 'Compressor de Imagens Online – Reduza JPG sem Perder Qualidade',
      intro: 'Fotos pesadas travam o carregamento de sites e são rejeitadas em cadastros públicos. Diminua o tamanho das suas imagens em até 80% mantendo tudo bem nítido.',
      whatHeading: 'Compressão local e sem envio de arquivos',
      whatItDoes: 'Fotos tiradas com smartphones modernos chegam a vários megabytes por conta de metadados ocultos. Essa ferramenta enxuga esses dados direto no seu navegador.\n\nComo tudo roda na sua própria máquina, o processo é imediato e 100% privado. Suas fotos não passam por servidores de terceiros e você baixa arquivos JPG ou WebP leves e prontos para envio.',
      howToHeading: 'Como comprimir suas fotos passo a passo',
      howToUse: [
        'Arraste uma ou várias fotos para o espaço indicado ou clique para selecionar.',
        'Ajuste o controle deslizante de qualidade ou escolha metas de tamanho (como 50KB ou 100KB).',
        'Confira na hora quantos kilobytes foram economizados com o comparador.',
        'Baixe suas imagens comprimidas individualmente ou todas juntas em um arquivo zip.'
      ],
      keyFeatures: [
        { title: 'Processamento no seu aparelho', desc: 'Seus arquivos não sobem para a nuvem; a compressão roda direto na memória do navegador.' },
        { title: 'Compressão em lote', desc: 'Processe várias fotos simultaneamente em poucos segundos com um único clique.' },
        { title: 'Controle de tamanho preciso', desc: 'Visualize o peso exato antes e depois de salvar para garantir que atende às exigências.' },
        { title: 'Suporte a WebP e JPG', desc: 'Converta arquivos pesados para os formatos mais modernos e eficientes da web.' }
      ],
      benefits: [
        'Atenda aos limites de tamanho exigidos por vestibulares, concursos e consulados.',
        'Melhore a velocidade do seu site e a pontuação no Google PageSpeed.',
        'Economize espaço de armazenamento no computador ou no celular.'
      ],
      whyChooseHeading: 'Por que usar o compressor do ToolWala',
      whyChoose: 'Muitos sites colocam marcas d\'água ou limitam o uso diário para forçar planos pagos. O ToolWala oferece uma solução limpa, direta e gratuita para você comprimir suas fotos sempre que precisar.',
      useCasesHeading: 'Principais situações de uso',
      useCases: [
        'Anexar foto 3x4 ou assinatura digitalizada em cadastros de concursos e bancos.',
        'Otimizar imagens de produtos para lojas virtuais e redes sociais.',
        'Reduzir arquivos para envio por e-mail sem estourar o limite de anexo.'
      ],
      faqs: [
        { question: 'Como reduzir o peso da imagem sem perder nitidez?', answer: 'Deixe o controle de qualidade entre 75% e 80%. Essa faixa corta a maior parte do peso sem gerar perda visual perceptível.' },
        { question: 'A ferramenta funciona offline?', answer: 'Sim. Após carregar a página pela primeira vez, a compressão roda inteiramente dentro da aba do seu navegador.' },
        { question: 'Imagens PNG com fundo transparente continuam transparentes?', answer: 'Sim, o canal de transparência é totalmente preservado na compressão de arquivos PNG.' }
      ],
      conclusionHeading: 'Rápido e descomplicado',
      conclusion: 'Reduza o peso das suas imagens em segundos com total privacidade e sem perder qualidade visual.'
    },
    hi: {
      title: 'इमेज कंप्रेसर ऑनलाइन – फोटो साइज कम करें बिना क्वालिटी खोए',
      intro: 'बड़ी और भारी तस्वीरें वेबसाइट को धीमा करती हैं और सरकारी फॉर्मों पर रिजेक्ट हो जाती हैं। अपनी फ़ोटो का साइज 80% तक घटाएं और क्लैरिटी बिल्कुल साफ रखें।',
      whatHeading: 'ब्राउज़र में सीधे साइज कम करें',
      whatItDoes: 'मोबाइल से खींची गई फोटो में बहुत सा गैर-जरूरी डेटा छुपा होता है जिससे उसका साइज 5-10 MB तक पहुंच जाता है। यह टूल सीधे आपके ब्राउज़र में उस साइज को कम करता है।\n\nफ़ाइल किसी सर्वर पर अपलोड नहीं होती, इसलिए काम तुरंत होता है और आपकी प्राइवेसी 100% सुरक्षित रहती है। आप अपनी पसंद का साइज (जैसे 50KB, 100KB या 200KB) चुनकर तुरंत हल्की JPG या WebP इमेज डाउनलोड कर सकते हैं।',
      howToHeading: 'फोटो का साइज कम करने का तरीका',
      howToUse: [
        'अपनी एक या अधिक तस्वीरें बॉक्स में डालें या सेलेक्ट करें।',
        'क्वालिटी स्लाइडर से साइज सेट करें या 50KB/100KB का प्रीसेट चुनें।',
        'लाइव साइज काउंटर देखें कि कितने KB की बचत हुई है।',
        'अपनी कंप्रेस की गई फोटो को एक-एक करके या जिप फ़ाइल में डाउनलोड करें।'
      ],
      keyFeatures: [
        { title: 'डिवाइस पर ही कम्प्रेशन', desc: 'फ़ोटो सर्वर पर नहीं भेजी जाती; सारा काम आपके फोन या कंप्यूटर के CPU पर होता है।' },
        { title: 'एक साथ कई फ़ोटो', desc: 'पूरे फोल्डर की तस्वीरें एक साथ डालें और एक ही बार में सबका साइज घटाएं।' },
        { title: 'लाइव साइज ट्रैकर', desc: 'सेव करने से पहले देखें कि फ़ोटो का ओरिजिनल और नया साइज कितना है।' },
        { title: 'WebP में बदलने की सुविधा', desc: 'भारी PNG और JPG को आधुनिक और हल्के WebP फॉर्मेट में बदलें।' }
      ],
      benefits: [
        'सरकारी फॉर्म, SSC, UPSC और बैंक भर्ती के 20KB/50KB नियमों में बिल्कुल फिट।',
        'वेबसाइट और ब्लॉग की स्पीड तेज़ करें।',
        'फ़ोन और लैपटॉप में मेमोरी की बचत करें।'
      ],
      whyChooseHeading: 'टूलवाला का इमेज कंप्रेसर क्यों चुनें',
      whyChoose: 'कई ऑनलाइन कंप्रेसर फोटो पर वॉटरमार्क लगा देते हैं या दिन में सिर्फ दो फोटो की छूट देते हैं। टूलवाला में कोई सीमा नहीं है — यह बिल्कुल फ्री, साफ-सुथरा और सुरक्षित टूल है।',
      useCasesHeading: 'सामान्य उपयोग',
      useCases: [
        'SSC, UPSC, NEET और प्रतियोगी परीक्षाओं के लिए फोटो और साइन का साइज घटाना।',
        'ईमेल में अटैचमेंट की तय सीमा के अंदर फोटो भेजना।',
        'वेबसाइट और सोशल मीडिया के लिए हल्की और तेज लोड होने वाली तस्वीरें तैयार करना।'
      ],
      faqs: [
        { question: 'क्वालिटी खराब किए बिना फोटो साइज कैसे कम करें?', answer: 'क्वालिटी स्लाइडर को 75-80% के बीच रखें। इससे फोटो की क्लैरिटी में कोई फर्क नहीं दिखता और 70% तक साइज कम हो जाता है।' },
        { question: 'क्या यह टूल बिना इंटरनेट के भी काम करता है?', answer: 'हाँ, एक बार पेज लोड होने के बाद कम्प्रेशन कोड सीधे आपके ब्राउज़र टैब में ऑफलाइन भी काम कर सकता है।' },
        { question: 'क्या PNG का ट्रांसपेरेंट बैकग्राउंड सुरक्षित रहता है?', answer: 'हाँ, PNG फोटो का पारदर्शी बैकग्राउंड बिल्कुल सुरक्षित रहता है।' }
      ],
      conclusionHeading: 'तेज और आसान',
      conclusion: 'भारी तस्वीरों की वजह से अपने फॉर्म अटकने न दें। बस कुछ सेकंड में साइज घटाएं और आसानी से अपलोड करें।'
    }
  },

  // ==========================================
  // MERGE PDF
  // ==========================================
  'merge-pdf': {
    es: {
      title: 'Unir PDF Gratis – Combina Archivos en tu Navegador',
      intro: '¿Necesitas un solo documento en lugar de varios sueltos? Arrastra tus archivos PDF, organízalos en el orden que quieras y descarga el resultado sin marcas de agua.',
      whatHeading: 'Unión directa en la memoria de tu dispositivo',
      whatItDoes: 'Cada PDF se abre localmente en esta pestaña. Las páginas se copian en un nuevo documento siguiendo el orden exacto de las tarjetas que ves en pantalla.\n\nFunciona tanto con documentos escaneados como con textos editables. La tipografía, las firmas y la nitidez original se mantienen intactas. Tus documentos personales nunca se transfieren a servidores externos.',
      howToHeading: 'Cómo combinar tus archivos PDF',
      howToUse: [
        'Arrastra dos o más archivos PDF a esta página o pulsa en Seleccionar archivos.',
        'Comprueba las tarjetas en pantalla: ese será el orden de lectura en el nuevo archivo.',
        'Arrastra las tarjetas o usa las flechas para colocar cada documento en su sitio.',
        'Asigna un nombre al archivo combinado si tu trámite exige un nombre concreto.',
        'Pulsa en Unir y descargar para guardar el PDF directamente desde tu navegador.'
      ],
      keyFeatures: [
        { title: 'Tus archivos se quedan aquí', desc: 'El documento final se genera en tu navegador sin enviar copias a la nube.' },
        { title: 'Sin marcas de agua ni cuentas', desc: 'Combina lo que necesites y descarga al instante sin dar tu correo electrónico.' },
        { title: 'Conserva la calidad original', desc: 'Las páginas se unen sin comprimir ni degradar textos, firmas o escaneos.' },
        { title: 'Funciona en móvil y ordenador', desc: 'Compatible con Chrome, Safari, Edge y Firefox sin instalar programas pesados.' }
      ],
      benefits: [
        'Documentos confidenciales y contratos protegidos en tu propio equipo.',
        'Reordena páginas fácilmente antes de consolidar el archivo final.',
        'Descargas inmediatas sin tiempos de espera en servidores.'
      ],
      whyChooseHeading: 'Por qué unir tus PDF aquí',
      whyChoose: 'Muchos sitios web te obligan a subir contratos confidenciales a servidores desconocidos o te imponen límites de páginas para cobrarte. ToolWala une tus documentos en la memoria local de tu dispositivo de forma limpia y transparente.',
      useCasesHeading: 'Usos recomendados',
      useCases: [
        'Juntar nóminas, contratos y cartas de oferta en un único expediente laboral.',
        'Unir anexos y justificantes tributarios para presentaciones ante la administración.',
        'Consolidar capítulos de apuntes, informes y trabajos académicos en un solo trabajo.'
      ],
      faqs: [
        { question: '¿Existe algún límite en la cantidad de páginas o archivos?', answer: 'Al ejecutarse en la memoria de tu navegador, puedes unir cómodamente lotes de 2 a más de 20 documentos sin problemas de rendimiento.' },
        { question: '¿Puedo unir archivos PDF protegidos con contraseña?', answer: 'Los documentos cifrados deben desbloquearse previamente para que el navegador pueda leer y combinar sus páginas.' },
        { question: '¿Se altera el formato de las páginas?', answer: 'No. Cada página mantiene sus dimensiones originales, fuentes vectoriales e imágenes con total fidelidad.' }
      ],
      conclusionHeading: 'Fácil y seguro',
      conclusion: 'Ordena tus documentos, únelos con un clic y descárgalos con total tranquilidad. Tus datos nunca salen de tu pestaña.'
    },
    pt: {
      title: 'Juntar PDF Grátis – Mesclar Arquivos sem Upload',
      intro: 'Precisa transformar vários arquivos em um único PDF organizado? Solte seus documentos aqui, coloque na ordem certa e baixe na hora sem marcas d\'água.',
      whatHeading: 'Como funciona a junção de arquivos no navegador',
      whatItDoes: 'Cada PDF é lido diretamente na memória local da sua aba. As páginas são reorganizadas e salvas em um novo documento exatamente na ordem que você escolher.\n\nFunciona com arquivos digitalizados ou gerados no computador. Assinaturas, fontes e imagens ficam exatamente como no original, sem qualquer perda de nitidez ou envio para servidores externos.',
      howToHeading: 'Passo a passo para juntar seus PDFs',
      howToUse: [
        'Arraste dois ou mais arquivos PDF para esta página ou clique em Escolher arquivos.',
        'Observe a ordem dos cartões na tela — essa será a ordem das páginas do novo PDF.',
        'Arraste os cartões ou use as setas para ajustar a sequência dos documentos.',
        'Escolha o nome do arquivo se o portal de envio exigir um padrão específico.',
        'Clique em Juntar e Baixar para salvar o documento pronto no seu dispositivo.'
      ],
      keyFeatures: [
        { title: 'Privacidade garantida', desc: 'O arquivo mesclado é montado dentro do seu navegador, sem envio para servidores remotos.' },
        { title: 'Sem cadastro e sem marcas', desc: 'Una seus documentos e faça o download direto sem precisar informar e-mail.' },
        { title: 'Qualidade preservada', desc: 'Textos, tabelas e assinaturas continuam nítidos como nos documentos originais.' },
        { title: 'Total compatibilidade', desc: 'Funciona perfeitamente em celulares Android, iPhones, notebooks e computadores de mesa.' }
      ],
      benefits: [
        'Seus documentos pessoais e contratos bancários nunca saem do seu aparelho.',
        'Reorganização simples da ordem dos arquivos antes de salvar.',
        'Processamento rápido sem filas de espera na internet.'
      ],
      whyChooseHeading: 'Por que usar o juntador de PDF do ToolWala',
      whyChoose: 'Serviços tradicionais enviam seus arquivos para a nuvem deles antes de liberar o download. O ToolWala processa tudo no seu próprio navegador, garantindo rapidez e mantendo seus dados em sigilo absoluto.',
      useCasesHeading: 'Onde as pessoas mais utilizam',
      useCases: [
        'Juntar comprovantes de renda, holerites e declaração de imposto para financiamentos.',
        'Combinar trabalhos acadêmicos, anexos e relatórios em uma única entrega.',
        'Agrupar faturas e relatórios mensais para envio a clientes e contabilidade.'
      ],
      faqs: [
        { question: 'Posso juntar quantos arquivos quiser?', answer: 'Sim. Em computadores e celulares comuns, lotes de 2 a 20 arquivos (ou até cerca de 100MB no total) funcionam com total fluidez.' },
        { question: 'O que fazer se o PDF tiver senha?', answer: 'Documentos protegidos precisam ter a senha removida antes de serem adicionados à fila de junção.' },
        { question: 'A qualidade dos textos ou gráficos cai ao juntar?', answer: 'Não. As páginas são copiadas de forma vetorial exata, sem compactação que prejudique a leitura.' }
      ],
      conclusionHeading: 'Pronto em segundos',
      conclusion: 'Arraste os arquivos, ordene as páginas e baixe seu PDF unificado com rapidez e segurança.'
    },
    hi: {
      title: 'PDF मर्ज करें – दो या अधिक PDF फ़ाइलें एक साथ जोड़ें',
      intro: 'कई अलग-अलग PDF को एक साफ़ दस्तावेज़ में जोड़ना चाहते हैं? अपनी फ़ाइलें यहाँ डालें, सही क्रम में लगाएं और बिना किसी वॉटरमार्क के तुरंत डाउनलोड करें।',
      whatHeading: 'फ़ाइलें कैसे जुड़ती हैं',
      whatItDoes: 'हर PDF सीधे आपके ब्राउज़र की लोकल मेमोरी में खुलती है। आपके द्वारा तय किए गए क्रम के अनुसार पेज एक नई फ़ाइल में कॉपी हो जाते हैं।\n\nटाइप किए गए दस्तावेज़ और स्कैन की गई फ़ाइलें दोनों इस पर सही काम करती हैं। फ़ॉन्ट, साइन और पेज की क्वालिटी पहले जैसी ही रहती है। आपकी निजी फ़ाइलें किसी भी सर्वर पर अपलोड नहीं होतीं।',
      howToHeading: 'PDF फ़ाइलें जोड़ने का आसान तरीका',
      howToUse: [
        'दो या अधिक PDF फ़ाइलें यहाँ ड्रैग करें या फ़ाइल चुनें पर क्लिक करें।',
        'स्क्रीन पर दिखने वाले कार्ड चेक करें — यही नई फ़ाइल में पेजों का क्रम होगा।',
        'कार्ड को खींचकर या तीरों का इस्तेमाल करके सही क्रम में सेट करें।',
        'यदि पोर्टल के लिए कोई विशेष नाम चाहिए तो फ़ाइल का नाम बदलें।',
        'मर्ज और डाउनलोड बटन दबाएं और तैयार PDF अपने डिवाइस में सेव करें।'
      ],
      keyFeatures: [
        { title: 'डिवाइस पर सुरक्षित', desc: 'मर्ज की गई PDF सीधे आपके ब्राउज़र में बनती है। फ़ाइलें हमारे सर्वर पर नहीं जातीं।' },
        { title: 'कोई साइनअप या वॉटरमार्क नहीं', desc: 'फ़ाइलें जोड़ें और तुरंत डाउनलोड करें। बीच में कोई ईमेल या लॉगिन की रुकावट नहीं।' },
        { title: 'ओरिजिनल क्वालिटी बरकरार', desc: 'टेक्स्ट, स्कैन और डिजिटल सिग्नेचर बिल्कुल साफ रहते हैं।' },
        { title: 'फ़ोन और लैपटॉप पर उपयोगी', desc: 'Chrome, Safari और सभी प्रमुख ब्राउज़रों में बिना कुछ इंस्टॉल किए काम करता है।' }
      ],
      benefits: [
        'निजी और आधिकारिक दस्तावेज़ कभी आपके डिवाइस से बाहर नहीं जाते।',
        'डाउनलोड करने से पहले पेजों का क्रम बदलने की पूरी आज़ादी।',
        'इंटरनेट पर अपलोड की प्रतीक्षा किए बिना तुरंत परिणाम।'
      ],
      whyChooseHeading: 'टूलवाला का PDF मर्जर क्यों चुनें',
      whyChoose: 'कई मुफ्त टूल्स आपके निजी कागजात को पहले अपने क्लाउड सर्वर पर मंगवाते हैं और फिर पैसे मांगते हैं। टूलवाला में सारा काम आपके अपने ब्राउज़र में सुरक्षित और ईमानदार तरीके से होता है।',
      useCasesHeading: 'सामान्य उपयोग',
      useCases: [
        'ITR-V, फॉर्म 16 और सैलरी स्लिप को टैक्स या लोन के लिए एक ही PDF में जोड़ना।',
        'कॉलेज प्रोजेक्ट, रिसर्च नोट्स और असाइनमेंट को एक क्रमबद्ध फ़ाइल बनाना।',
        'नौकरी के लिए रिज्यूमे, अनुभव प्रमाण पत्र और डिग्री को एक साथ अटैच करना।'
      ],
      faqs: [
        { question: 'एक बार में कितनी फ़ाइलें जोड़ी जा सकती हैं?', answer: 'आप सामान्य रूप से 2 से 20 फ़ाइलें (लगभग 100MB तक) आसानी से एक साथ जोड़ सकते हैं।' },
        { question: 'क्या पासवर्ड वाली PDF जुड़ सकती है?', answer: 'पासवर्ड सुरक्षित फ़ाइल को जोड़ने से पहले उसका पासवर्ड हटाना आवश्यक है।' },
        { question: 'क्या जोड़ने के बाद टेक्स्ट या इमेज धुंधली होती है?', answer: 'नहीं, यह ओरिजिनल पेजों को बिना किसी बदलाव के हूबहू नए दस्तावेज़ में जोड़ता है।' }
      ],
      conclusionHeading: 'सुरक्षित और तेज़',
      conclusion: 'फ़ाइलें चुनें, सही क्रम लगाएं और तुरंत अपनी सिंगल PDF डाउनलोड करें। पूरी प्राइवेसी के साथ।'
    }
  },

  // ==========================================
  // EDIT PDF
  // ==========================================
  'edit-pdf': {
    es: {
      title: 'Editar PDF Online Gratis – Modifica Texto y Anota en Privado',
      intro: 'Corrige erratas, actualiza fechas o firma documentos al instante sin suscripciones caras. Edita texto directamente en tu navegador con total confidencialidad.',
      whatHeading: 'Edición directa sin subir documentos a la nube',
      whatItDoes: 'Muchas herramientas en línea suben tus contratos a servidores externos o colocan parches toscos sobre el texto. ToolWala funciona de manera distinta: abre tu PDF directamente en la memoria local de tu navegador.\n\nPuedes modificar texto existente, añadir párrafos nuevos, resaltar líneas importantes o estampar tu firma dibujada a mano. Cuando termines, descargas un archivo vectorial limpio y nítido sin que tu información haya salido de tu equipo.',
      howToHeading: 'Cómo editar tu documento PDF',
      howToUse: [
        'Arrastra tu documento PDF a la ventana del editor.',
        'Haz clic sobre el texto que quieras corregir o pulsa para añadir un nuevo cuadro.',
        'Escribe tus cambios directamente con ajuste automático de color y tamaño.',
        'Añade anotaciones, resalta cláusulas o dibuja tu firma si es necesario.',
        'Pulsa en Guardar cambios para descargar tu PDF actualizado al instante.'
      ],
      keyFeatures: [
        { title: '100% en tu ordenador', desc: 'Tus contratos, nóminas y estados de cuenta bancarios nunca viajan por la red.' },
        { title: 'Edición de texto directa', desc: 'Modifica palabras y números en el propio texto del PDF sin trucos raros.' },
        { title: 'Anotaciones y firmas', desc: 'Dibuja firmas digitales y subraya partes clave del documento.' },
        { title: 'Sin suscripciones', desc: 'Evita costosas cuotas mensuales para hacer retoques sencillos y rápidos.' }
      ],
      benefits: [
        'Privacidad absoluta para documentos legales, médicos y financieros.',
        'No requiere instalar pesados programas de escritorio.',
        'Funciona en Windows, Mac, Chromebooks y tabletas.'
      ],
      whyChooseHeading: 'Por qué editar con ToolWala',
      whyChoose: 'Subir documentos privados a servidores desconocidos es un riesgo innecesario. ToolWala realiza todo el procesamiento en el navegador de tu dispositivo, dándote libertad total para corregir textos y descargar en segundos.',
      useCasesHeading: 'Situaciones habituales',
      useCases: [
        'Corregir fechas, nombres o cantidades en facturas y recibos oficiales.',
        'Rellenar formularios de solicitud de empleo o contratos de arrendamiento.',
        'Firmar acuerdos de confidencialidad o presupuestos freelance.'
      ],
      faqs: [
        { question: '¿Es realmente seguro editar documentos confidenciales aquí?', answer: 'Sí, totalmente seguro. A diferencia de otras páginas web, ToolWala no transfiere tu archivo a ningún servidor. Todo el código corre localmente en tu navegador.' },
        { question: '¿Puedo editar texto existente o solo añadir cajas nuevas?', answer: 'Puedes hacer ambas cosas: hacer clic en el texto existente para corregir palabras o pulsar en cualquier zona vacía para insertar texto nuevo.' },
        { question: '¿Mantiene la calidad de los documentos de varias páginas?', answer: 'Sí, todas las páginas conservan su nitidez vectorial intacta sin perder definición.' }
      ],
      conclusionHeading: 'Rápido y confidencial',
      conclusion: 'Haz los retoques que necesitas, firma lo que corresponda y descarga tu PDF limpio en segundos.'
    },
    pt: {
      title: 'Editar PDF Online Grátis – Altere Textos e Assine em Sigilo',
      intro: 'Corrija erros de digitação, atualize datas de faturas ou assine contratos sem mensalidades caras. Edite textos diretamente no navegador com privacidade total.',
      whatHeading: 'Edição na memória local do seu dispositivo',
      whatItDoes: 'A maioria dos sites de PDF exige o envio de documentos confidenciais para servidores em nuvem. O ToolWala processa o arquivo diretamente na memória da sua aba.\n\nVocê pode clicar para alterar palavras existentes, digitar novas informações, grifar trechos importantes e desenhar sua assinatura. O resultado é um PDF vetorial nítido e seguro baixado em segundos.',
      howToHeading: 'Passos para editar seu arquivo PDF',
      howToUse: [
        'Solte seu arquivo PDF na janela de edição.',
        'Clique na ferramenta de texto e selecione a palavra ou frase que deseja alterar.',
        'Digite suas correções — o editor ajusta fontes e cores de forma harmoniosa.',
        'Adicione sua assinatura ou marque termos importantes se necessário.',
        'Clique em Salvar alterações para baixar o PDF atualizado imediatamente.'
      ],
      keyFeatures: [
        { title: 'Processamento 100% no seu aparelho', desc: 'Contratos, holerites e extratos bancários não saem do seu computador.' },
        { title: 'Edição direta de texto', desc: 'Clique nos blocos de texto para arrumar nomes, datas e valores numéricos.' },
        { title: 'Ferramentas de assinatura', desc: 'Desenhe rubricas ou assinaturas completas diretamente nas páginas.' },
        { title: 'Zero instalação', desc: 'Use direto no Chrome, Edge ou Safari sem baixar softwares pesados.' }
      ],
      benefits: [
        'Economize sem precisar pagar planos mensais caros para ajustes simples.',
        'Sigilo total de dados para contratos comerciais e informações pessoais.',
        'Edição rápida e intuitiva compatível com computadores e tablets.'
      ],
      whyChooseHeading: 'Por que editar seus PDFs no ToolWala',
      whyChoose: 'Construímos esta ferramenta porque enviar contratos confidenciais para servidores na internet é uma falha de segurança. No ToolWala, o processamento acontece dentro da sua máquina com total discrição e velocidade.',
      useCasesHeading: 'Exemplos práticos de uso',
      useCases: [
        'Atualizar datas de vencimento ou valores em faturas e recibos.',
        'Preencher cadastros, formulários de inscrição e termos de compromisso.',
        'Assinar contratos de prestação de serviços e acordos de confidencialidade.'
      ],
      faqs: [
        { question: 'É seguro editar documentos com dados bancários ou pessoais aqui?', answer: 'Sim. Seus documentos nunca são enviados para a internet. Toda a edição ocorre localmente na memória do seu navegador.' },
        { question: 'Consigo editar textos que já estavam no PDF?', answer: 'Sim. Você pode clicar no texto original para alterar caracteres ou adicionar caixas de texto complementares.' },
        { question: 'O editor funciona com arquivos de várias páginas?', answer: 'Sim. Você pode navegar por todas as páginas e editar cada uma delas sem perder a nitidez vetorial.' }
      ],
      conclusionHeading: 'Edite e salve em instantes',
      conclusion: 'Faça suas alterações, assine o que for preciso e baixe seu PDF finalizado em poucos segundos.'
    },
    hi: {
      title: 'PDF एडिट करें ऑनलाइन – टेक्स्ट बदलें, साइन करें और नोट्स जोड़ें',
      intro: 'टाइपिंग की गलती सुधारनी हो, इनवॉइस की तारीख बदलनी हो या कॉन्ट्रैक्ट पर साइन करना हो — महंगे सॉफ्टवेयर की जरूरत नहीं। सीधे अपने ब्राउज़र में पूरी प्राइवेसी के साथ PDF एडिट करें।',
      whatHeading: 'ब्राउज़र में सीधे सुरक्षित एडिटिंग',
      whatItDoes: 'ज़्यादातर वेबसाइटें आपके संवेदनशील कागजात अपने सर्वर पर अपलोड करवाती हैं। टूलवाला अलग तरह से काम करता है — यह आपकी PDF को सीधे आपके ब्राउज़र की मेमोरी में खोलता है।\n\nआप किसी भी शब्द या तारीख पर क्लिक करके बदलाव कर सकते हैं, नया टेक्स्ट जोड़ सकते हैं, महत्वपूर्ण लाइनों को हाइलाइट कर सकते हैं और अपना साइन जोड़ सकते हैं। आपका दस्तावेज़ कभी आपके कंप्यूटर या फोन से बाहर नहीं जाता।',
      howToHeading: 'PDF एडिट करने के आसान स्टेप्स',
      howToUse: [
        'अपनी PDF फ़ाइल को एडिटर विंडो में डालें।',
        'टेक्स्ट टूल चुनें और जिस शब्द या लाइन को बदलना है उस पर क्लिक करें।',
        'सीधे बदलाव टाइप करें — फ़ॉन्ट साइज और कलर अपने आप मैच हो जाता है।',
        'ज़रूरत हो तो अपना साइन जोड़ें या ज़रूरी बातों को हाइलाइट करें।',
        'सेव करें पर क्लिक करके तुरंत अपनी अपडेटेड PDF डाउनलोड करें।'
      ],
      keyFeatures: [
        { title: '100% आपके डिवाइस पर', desc: 'बैंक स्टेटमेंट, एग्रीमेंट और टैक्स फॉर्म कभी इंटरनेट पर नहीं भेजे जाते।' },
        { title: 'सीधे टेक्स्ट में बदलाव', desc: 'नाम, तारीख या नंबर में हुई गलती को बिना किसी झंझट के तुरंत ठीक करें।' },
        { title: 'सिग्नेचर और हाइलाइटर', desc: 'दस्तावेज़ पर सीधे डिजिटल साइन जोड़ें और ज़रूरी शर्तों को मार्क करें।' },
        { title: 'कोई इंस्टॉलेशन नहीं', desc: 'Mac, Windows, लैपटॉप और टैबलेट पर बिना कुछ डाउनलोड किए तुरंत काम करता है।' }
      ],
      benefits: [
        'छोटे-मोटे बदलावों के लिए महंगे सॉफ्टवेयर के पैसे बचाएं।',
        'गोपनीय अनुबंधों और कागजात के लिए पूरी डेटा सुरक्षा।',
        'तुरंत डाउनलोड और आसान इंटरफ़ेस।'
      ],
      whyChooseHeading: 'टूलवाला का PDF एडिटर क्यों चुनें',
      whyChoose: 'संवेदनशील कागजात किसी अनजान सर्वर पर अपलोड करना बड़ा रिस्क है। टूलवाला में सारा काम आपके अपने ब्राउज़र में होता है, जिससे आपको पूरी आज़ादी और पक्की प्राइवेसी मिलती है।',
      useCasesHeading: 'लोग इसका उपयोग कहाँ करते हैं',
      useCases: [
        'बिल या रसीद में हुई टाइपिंग की गलती और तारीख सुधारने के लिए।',
        'जॉब एप्लीकेशन फॉर्म और डिक्लेरेशन भरने के लिए।',
        'फ्रीलांस कॉन्ट्रैक्ट और एग्रीमेंट पर साइन जोड़ने के लिए।'
      ],
      faqs: [
        { question: 'क्या यहाँ पर्सनल कागजात एडिट करना सुरक्षित है?', answer: 'हाँ, बिल्कुल। टूलवाला आपकी फ़ाइल को किसी भी सर्वर पर अपलोड नहीं करता। सारा काम आपके डिवाइस के अंदर ही होता है।' },
        { question: 'क्या पुराने टेक्स्ट को भी बदला जा सकता है?', answer: 'हाँ, आप पहले से मौजूद टेक्स्ट पर क्लिक करके शब्द बदल सकते हैं या नई टेक्स्ट बॉक्स जोड़ सकते हैं।' },
        { question: 'क्या कई पेजों वाली PDF भी सपोर्ट होती है?', answer: 'हाँ, आप सभी पेजों को स्क्रॉल करके देख सकते हैं और किसी भी पेज पर एडिट कर सकते हैं।' }
      ],
      conclusionHeading: 'आसान और निजी',
      conclusion: 'अपनी PDF में ज़रूरी सुधार करें, साइन लगाएं और कुछ ही पलों में साफ़-सुथरी फ़ाइल डाउनलोड करें।'
    }
  },

  // ==========================================
  // COMPRESS PDF
  // ==========================================
  'compress-pdf': {
    es: {
      title: 'Comprimir PDF en tu Navegador – Reduce Tamaño sin Subir Archivos',
      intro: '¿El portal de trámites te rechaza el PDF por exceso de peso? Optimiza tu archivo directamente en tu navegador con total honestidad sobre el tamaño real obtenido.',
      whatHeading: 'Cómo se reduce el tamaño del documento',
      whatItDoes: 'Esta página reescribe la estructura interna del PDF directamente en tu pestaña para eliminar datos redundantes sin enviar tu archivo a ningún servidor.\n\nUn documento compuesto únicamente de texto limpio suele reducirse entre un 2% y un 10%. En cambio, las páginas escaneadas o con imágenes pesadas logran reducciones mucho mayores. La tarjeta de resultados siempre te muestra los bytes exactos ahorrados.',
      howToHeading: 'Pasos para optimizar tu PDF',
      howToUse: [
        'Arrastra tu documento PDF a la página.',
        'Selecciona el nivel de compresión deseado.',
        'Pulsa en Optimizar y espera a ver el tamaño real en la tarjeta de resultados.',
        'Si el archivo ya estaba optimizado, el sistema te avisará con total transparencia.',
        'Descarga el PDF optimizado listo para subir a tu trámite oficial o enviar por correo.'
      ],
      keyFeatures: [
        { title: 'Tus datos no salen de aquí', desc: 'El documento se reescribe dentro de tu navegador, garantizando total privacidad.' },
        { title: 'Resultados reales y honestos', desc: 'Muestra los bytes exactos reducidos sin falsas promesas publicitarias.' },
        { title: 'Sin suscripciones ni registros', desc: 'Comprime tus documentos y descárgalos al instante sin dar tu correo electrónico.' },
        { title: 'Listo para trámites oficiales', desc: 'Perfecto para portales administrativos, universidades y agencias tributarias.' }
      ],
      benefits: [
        'Tus declaraciones de impuestos y nóminas se procesan con total confidencialidad.',
        'Sabes el tamaño exacto antes de descargar el archivo.',
        'Sin marcas de agua ni límites artificiales de uso.'
      ],
      whyChooseHeading: 'Por qué comprimir con ToolWala',
      whyChoose: 'Muchos sitios prometen reducir un 80% en cualquier archivo y luego cobran por la descarga. En ToolWala no hay servidores intermediarios: te mostramos con honestidad cuánto se puede reducir y mantenemos tu información segura en tu dispositivo.',
      useCasesHeading: 'Trámites frecuentes',
      useCases: [
        'Ajustar declaraciones tributarias y justificantes a los límites de la Agencia Tributaria.',
        'Subir expedientes académicos o títulos a portales universitarios con topes de 2MB.',
        'Comprimir facturas y contratos para enviarlos por correo sin rebotar.'
      ],
      faqs: [
        { question: '¿Por qué algunos archivos apenas reducen su tamaño?', answer: 'Los documentos de texto puro ya están muy comprimidos por naturaleza. Las mayores reducciones se dan en documentos escaneados o con imágenes insertadas.' },
        { question: '¿Es seguro pasar documentos bancarios o fiscales por esta herramienta?', answer: 'Sí, absolutamente. El procesamiento se ejecuta en la memoria local de tu navegador. El archivo nunca sale de tu equipo.' },
        { question: '¿Qué hago si mi PDF tiene contraseña?', answer: 'Debes desbloquear la contraseña antes de procesarlo para que el navegador pueda leer y reescribir su contenido.' }
      ],
      conclusionHeading: 'Directo y transparente',
      conclusion: 'Coloca tu PDF, realiza una pasada y comprueba el tamaño exacto. Si el archivo ya estaba ajustado, te lo diremos sin rodeos.'
    },
    pt: {
      title: 'Comprimir PDF no Navegador – Reduza o Tamanho sem Upload',
      intro: 'O site do governo ou da faculdade rejeitou seu PDF por estar muito pesado? Reduza o arquivo direto no navegador com clareza sobre o tamanho real alcançado.',
      whatHeading: 'Como o tamanho do documento é reduzido',
      whatItDoes: 'Esta ferramenta reorganiza os dados internos do arquivo PDF direto na aba do seu navegador, sem fazer upload para servidores externos.\n\nDocumentos compostos apenas por texto já nascem compactados e costumam diminuir entre 2% e 10%. Já páginas digitalizadas ou com fotos pesadas encolhem muito mais. O cartão de resultado mostra na hora o peso final exato.',
      howToHeading: 'Como comprimir seu PDF passo a passo',
      howToUse: [
        'Arraste o arquivo PDF para a área de envio.',
        'Escolha o nível de compressão desejado.',
        'Clique em Otimizar e aguarde a leitura do tamanho real no cartão.',
        'Se o arquivo já estiver no limite da compactação, avisamos você com transparência.',
        'Baixe seu PDF pronto para envio sem marcas d\'água.'
      ],
      keyFeatures: [
        { title: 'Fica no seu aparelho', desc: 'O arquivo é reescrito dentro da aba do navegador sem cópias na nuvem.' },
        { title: 'Tamanho real na tela', desc: 'Você vê os kilobytes exatos economizados antes de decidir pelo download.' },
        { title: 'Sem cadastros', desc: 'Otimize e baixe sem precisar criar conta ou digitar seu e-mail.' },
        { title: 'Ideal para portais públicos', desc: 'Ajuste documentos para exigências de bancos, faculdades e Receita Federal.' }
      ],
      benefits: [
        'Contratos e dados fiscais mantidos em total privacidade.',
        'Visualização imediata do peso do arquivo.',
        'Sem marcas no documento e 100% gratuito.'
      ],
      whyChooseHeading: 'Por que usar o compressor do ToolWala',
      whyChoose: 'Vários compressores na internet prometem cortes milagrosos de 80% em qualquer arquivo só para atrair cliques. Aqui somos transparentes: o arquivo é enxugado localmente no seu computador e você vê o ganho real de espaço sem surpresas.',
      useCasesHeading: 'Principais exigências de portais',
      useCases: [
        'Reduzir declarações de imposto de renda e recibos para sistemas da Receita.',
        'Ajustar relatórios acadêmicos e monografias para sistemas universitários.',
        'Diminuir o tamanho de propostas comerciais para envio rápido por e-mail.'
      ],
      faqs: [
        { question: 'Por que meu PDF quase não diminuiu de tamanho?', answer: 'Arquivos gerados a partir de texto no Word já são muito leves. A maior taxa de compressão acontece em documentos escaneados e com fotos incorporadas.' },
        { question: 'É seguro comprimir holerites e extratos bancários aqui?', answer: 'Sim. Todo o processamento ocorre no próprio navegador, sem envio de cópias para nossos servidores.' },
        { question: 'Posso comprimir arquivos protegidos por senha?', answer: 'É necessário remover a senha de proteção antes de enviar o arquivo para que a estrutura possa ser reorganizada.' }
      ],
      conclusionHeading: 'Claro e objetivo',
      conclusion: 'Solte seu PDF, faça a otimização e confira o peso real. Sem enrolação e com total sigilo dos seus dados.'
    },
    hi: {
      title: 'PDF कंप्रेस करें – फ़ाइल साइज कम करें बिना सर्वर अपलोड के',
      intro: 'क्या पोर्टल पर बड़ा साइज होने की वजह से आपकी PDF रिजेक्ट हो रही है? फ़ाइल को सीधे अपने ब्राउज़र में छोटा करें और असली साइज की सही जानकारी पाएं।',
      whatHeading: 'फ़ाइल का साइज वास्तव में कैसे कम होता है',
      whatItDoes: 'यह पेज आपकी PDF को सीधे आपके ब्राउज़र टैब में दोबारा प्रोसेस करता है ताकि गैर-जरूरी डेटा हट सके।\n\nअगर दस्तावेज़ सिर्फ टाइप किए गए टेक्स्ट का है, तो उसका साइज पहले से ही काफी कम होता है (उसमें 2-10% की ही कमी आती है)। लेकिन अगर पेज फोन से स्कैन किए गए हैं या उनमें तस्वीरें हैं, तो साइज काफी घट जाता है। रिजल्ट कार्ड पर हमेशा असली साइज दिखता है।',
      howToHeading: 'PDF कंप्रेस करने के आसान स्टेप्स',
      howToUse: [
        'अपनी PDF फ़ाइल यहाँ ड्रैग करें।',
        'कम्प्रेशन का स्तर चुनें।',
        'ऑप्टिमाइज़ पर क्लिक करें और रिजल्ट कार्ड पर नया साइज देखें।',
        'अगर फ़ाइल पहले से ही पूरी तरह कंप्रेस है, तो कार्ड आपको साफ़ बता देगा।',
        'तय साइज में आने के बाद PDF डाउनलोड करें और पोर्टल पर अपलोड करें।'
      ],
      keyFeatures: [
        { title: 'डिवाइस पर ही प्रोसेस', desc: 'फ़ाइल सीधे आपके ब्राउज़र में दोबारा लिखी जाती है — सर्वर पर कुछ नहीं भेजा जाता।' },
        { title: 'ईमानदार साइज रिपोर्ट', desc: 'झूठे वादों के बजाय रिजल्ट कार्ड पर असली बाइट्स और साइज दिखता है।' },
        { title: 'कोई साइनअप नहीं', desc: 'कंप्रेस करें और तुरंत डाउनलोड करें। बीच में कोई अकाउंट बनाने की जरूरत नहीं।' },
        { title: 'सरकारी पोर्टल्स के लिए उपयोगी', desc: 'इनकम टैक्स, जीएसटी, यूनिवर्सिटी और भर्ती पोर्टल्स के लिए उपयुक्त।' }
      ],
      benefits: [
        'टैक्स पेपर्स और निजी रिकॉर्ड्स पूरी तरह सुरक्षित रहते हैं।',
        'डाउनलोड करने से पहले नया साइज साफ़ दिखाई देता है।',
        'कोई वॉटरमार्क नहीं और कोई फ़ाइल लिमिट नहीं।'
      ],
      whyChooseHeading: 'टूलवाला का PDF कंप्रेसर क्यों बेहतर है',
      whyChoose: 'बहुत से टूल्स हर फ़ाइल पर 80% कमी का झूठा दावा करते हैं। टूलवाला में सच्चाई सामने होती है: अगर फ़ाइल पहले से ऑप्टिमाइज़ है तो हम साफ बता देते हैं, और आपकी फ़ाइल कभी आपके कंप्यूटर से बाहर नहीं जाती।',
      useCasesHeading: 'सामान्य उपयोग',
      useCases: [
        'इनकम टैक्स (ITR) और फॉर्म 16 को पोर्टल की तय सीमा के अंदर लाना।',
        'कॉलेज और यूनिवर्सिटी एडमिशन पोर्टल पर मार्कशीट का साइज छोटा करना।',
        'ईमेल अटैचमेंट की तय सीमा के अंदर बड़ी PDF भेजना।'
      ],
      faqs: [
        { question: 'कुछ फ़ाइलों का साइज बहुत कम क्यों नहीं घटता?', answer: 'सिर्फ टेक्स्ट वाली PDF पहले से ही बहुत हल्की होती हैं। ज्यादा कम्प्रेशन उन फ़ाइलों में मिलता है जो कैमरे से स्कैन की गई हों या जिनमें भारी तस्वीरें हों।' },
        { question: 'क्या यहाँ टैक्स पेपर्स या बैंक स्टेटमेंट कंप्रेस करना सुरक्षित है?', answer: 'हाँ, पूरी तरह सुरक्षित। सारा काम सीधे आपके ब्राउज़र में होता है और फ़ाइल कभी हमारे सर्वर पर नहीं जाती।' },
        { question: 'पासवर्ड वाली PDF कैसे कंप्रेस करें?', answer: 'पासवर्ड सुरक्षित फ़ाइल का पासवर्ड पहले अनलॉक करें, फिर उसे यहाँ कंप्रेस करें।' }
      ],
      conclusionHeading: 'पारदर्शी और सुरक्षित',
      conclusion: 'PDF डालें, कंप्रेस करें और असली साइज देखें। बिना किसी झंझट और बिना प्राइवेसी से समझौता किए।'
    }
  }
};

export function getLocalizedToolArticle(toolId: string, locale: string): LocalizedArticleData | null {
  if (!toolId || !locale || locale === 'en') return null;
  const toolArticles = LOCALIZED_TOOL_ARTICLES[toolId];
  if (!toolArticles) return null;
  return toolArticles[locale] || null;
}
