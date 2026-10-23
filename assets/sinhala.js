/**
 * Sinhala Studio Core Engine:
 * 1. Real-time Singlish to Sinhala Unicode Phonetic Transliteration
 * 2. Sinhala Unicode to FM Abhaya (UCSC Algorithm)
 * 3. FM Abhaya to Sinhala Unicode (Pandukabhaya Algorithm)
 * Powered by PrasaTek System Solutions - SupiriConvertPRO
 */

(function (window) {
  'use strict';

  // ========================================================
  // 1. SINGLISH TO SINHALA PHONETIC ENGINE
  // ========================================================
  const consonants = [
    // 3-char prefixes (matched longest first)
    ['zdh', '\u0DB3'], // ඳ
    ['chh', '\u0DA1'], // ඡ
    ['thh', '\u0DAE'], // ථ
    ['dhh', '\u0DB0'], // ධ
    ['zg', '\u0D9F'],  // ඟ
    ['zj', '\u0DA6'],  // ඦ
    ['zd', '\u0DAC'],  // ඬ
    ['zk', '\u0DA4'],  // ඤ
    ['zh', '\u0DA5'],  // ඥ
    ['kh', '\u0D9B'],  // ඛ
    ['gh', '\u0D9D'],  // ඝ
    ['ph', '\u0DB5'],  // ඵ
    ['bh', '\u0DB7'],  // භ
    ['sh', '\u0DC1'],  // ශ
    ['Sh', '\u0DC2'],  // ෂ
    ['ch', '\u0DA0'],  // ච
    ['th', '\u0DAD'],  // ත
    ['dh', '\u0DAF'],  // ද

    // 1-char prefixes
    ['k', '\u0D9A'],   // ක
    ['g', '\u0D9C'],   // ග
    ['j', '\u0DA2'],   // ජ
    ['t', '\u0DA7'],   // ට
    ['d', '\u0DA9'],   // ඩ
    ['n', '\u0DB1'],   // න
    ['N', '\u0DAB'],   // ණ
    ['p', '\u0DB4'],   // ප
    ['b', '\u0DB6'],   // බ
    ['m', '\u0DB8'],   // ම
    ['y', '\u0DBA'],   // ය
    ['r', '\u0DBB'],   // ර
    ['l', '\u0DBD'],   // ල
    ['L', '\u0DC5'],   // ළ
    ['w', '\u0DC0'],   // ව
    ['v', '\u0DC0'],   // ව
    ['s', '\u0DC3'],   // ස
    ['S', '\u0DC2'],   // ෂ
    ['h', '\u0DC4'],   // හ
    ['f', '\u0DC6'],   // ෆ
    ['J', '\u0DA3'],   // ඣ
    ['T', '\u0DA8'],   // ඨ
    ['D', '\u0DAA'],   // ඪ
    ['B', '\u0DB9']    // ඹ
  ];

  const independentVowels = [
    ['Aa', '\u0D88'], // ඈ
    ['AA', '\u0D88'], // ඈ
    ['aa', '\u0D86'], // ආ
    ['A', '\u0D87'],  // ඇ
    ['a', '\u0D85'],  // අ
    ['ii', '\u0D8A'], // ඊ
    ['i', '\u0D89'],  // ඉ
    ['uu', '\u0D8C'], // ඌ
    ['u', '\u0D8B'],  // උ
    ['Ru', '\u0D8E'], // ඎ
    ['R', '\u0D8D'],  // ඍ
    ['ee', '\u0D92'], // ඒ
    ['ai', '\u0D93'], // ඓ
    ['e', '\u0D91'],  // එ
    ['oo', '\u0D95'], // ඕ
    ['au', '\u0D96'], // ඖ
    ['ou', '\u0D96'], // ඖ
    ['o', '\u0D94']   // ඔ
  ];

  const pillams = [
    ['aH', '\u0D83'],   // ඃ (Visargaya)
    ['ax', '\u0D82'],   // ං (Anusvaraya)
    ['aX', '\u0D82'],   // ං (Anusvaraya modifier)
    ['azn', '\u0D82'],  // ං
    ['x', '\u0D82'],    // ං
    ['H', '\u0D83'],    // ඃ
    ['X', '\u0D82'],    // ං
    ['aa', '\u0DCF'],   // ා
    ['Aa', '\u0DD1'],   // ෑ
    ['AA', '\u0DD1'],   // ෑ
    ['A', '\u0DD0'],    // ැ
    ['a', ''],          // inherent vowel
    ['ii', '\u0DD3'],   // ී
    ['i', '\u0DD2'],    // ි
    ['uu', '\u0DD6'],   // ූ
    ['u', '\u0DD4'],    // ු
    ['ruu', '\u0DF2'],  // ෲ
    ['Ru', '\u0DF2'],   // ෲ
    ['ru', '\u0DD8'],   // ෘ
    ['R', '\u0DD8'],    // ෘ
    ['ee', '\u0DDA'],   // ේ
    ['ai', '\u0DDB'],   // ෛ
    ['e', '\u0DD9'],    // ෙ
    ['oo', '\u0DDD'],   // ෝ
    ['au', '\u0DDE'],   // ෞ
    ['ou', '\u0DDE'],   // ෞ
    ['o', '\u0DDC']     // ො
  ];

  function convertSinglishToSinhala(text) {
    if (!text) return '';
    let out = '';
    let i = 0;
    const n = text.length;

    while (i < n) {
      // Special: 'Lu' -> ළු
      if (text.substr(i, 2) === 'Lu') {
        out += '\u0DC5\u0DD4';
        i += 2;
        continue;
      }

      // Check Consonants
      let matchedC = null;
      let matchedCLen = 0;
      for (let c = 0; c < consonants.length; c++) {
        const cStr = consonants[c][0];
        if (text.substr(i, cStr.length) === cStr) {
          matchedC = consonants[c][1];
          matchedCLen = cStr.length;
          break;
        }
      }

      if (matchedC !== null) {
        i += matchedCLen;

        // Check Yansaya / Rakaransaya conjuncts
        let conjunct = '';
        if (i < n && text[i] === 'y') {
          conjunct = '\u0DCA\u200D\u0DBA'; // Yansaya (ක්ය)
          i += 1;
        } else if (i < n && text[i] === 'r' && text.substr(i, 2) !== 'ru' && text.substr(i, 3) !== 'ruu') {
          conjunct = '\u0DCA\u200D\u0DBB'; // Rakaransaya (ක්ර)
          i += 1;
        } else if (i < n && text[i] === 'Y') {
          conjunct = '\u0DBA'; // Capital Y (කය)
          i += 1;
        } else if (i < n && text[i] === 'R' && text.substr(i, 2) !== 'Ru') {
          conjunct = '\u0DBB'; // Capital R (කර)
          i += 1;
        }

        // Check Vowel Modifier (Pillam)
        let matchedP = null;
        let matchedPLen = 0;
        for (let p = 0; p < pillams.length; p++) {
          const pStr = pillams[p][0];
          if (text.substr(i, pStr.length) === pStr) {
            matchedP = pillams[p][1];
            matchedPLen = pStr.length;
            break;
          }
        }

        if (matchedP !== null) {
          out += matchedC + conjunct + matchedP;
          i += matchedPLen;
        } else {
          // No vowel attached -> Hal form with al-lakuna
          out += matchedC + (conjunct ? conjunct : '\u0DCA');
        }
        continue;
      }

      // Check Independent Vowels
      let matchedV = null;
      let matchedVLen = 0;
      for (let v = 0; v < independentVowels.length; v++) {
        const vStr = independentVowels[v][0];
        if (text.substr(i, vStr.length) === vStr) {
          matchedV = independentVowels[v][1];
          matchedVLen = vStr.length;
          break;
        }
      }

      if (matchedV !== null) {
        out += matchedV;
        i += matchedVLen;
        continue;
      }

      // Punctuation, numbers, whitespace, or unhandled
      out += text[i];
      i += 1;
    }

    return out;
  }

  // ========================================================
  // 2. SINHALA UNICODE -> FM ABHAYA CONVERTER (UCSC)
  // ========================================================
  function convertUnicodeToFM(text) {
    if (!text) return '';
    text = text.replace(/\=/g, "ￏ");
    text = text.replace(/\'/g, "ￎ");
    text = text.replace(/\+/g, "ￍ");
    text = text.replace(/\:/g, "ￌ");
    text = text.replace(/\÷/g, "ￋ");
    text = text.replace(/\;/g, "ﾶ");
    text = text.replace(/ත්‍රෛ/g, "ff;%");
    text = text.replace(/ශෛ/g, "ffY");
    text = text.replace(/චෛ/g, "ffp");
    text = text.replace(/ජෛ/g, "ffc");
    text = text.replace(/කෛ/g, "ffl");
    text = text.replace(/මෛ/g, "ffu");
    text = text.replace(/පෛ/g, "ffm");
    text = text.replace(/දෛ/g, "ffo");
    text = text.replace(/තෛ/g, "ff;");
    text = text.replace(/නෛ/g, "ffk");
    text = text.replace(/ධෛ/g, "ffO");
    text = text.replace(/වෛ/g, "ffj");
    text = text.replace(/ප්‍රෞ/g, "fm%!");
    text = text.replace(/ෂ්‍යෝ/g, "fIHda");
    text = text.replace(/ඡ්‍යෝ/g, "fPHda");
    text = text.replace(/ඪ්‍යෝ/g, "fVHda");
    text = text.replace(/ඝ්‍යෝ/g, "f>Hda");
    text = text.replace(/ඛ්‍යෝ/g, "fLHda");
    text = text.replace(/ළ්‍යෝ/g, "f<Hda");
    text = text.replace(/ඵ්‍යෝ/g, "fMHda");
    text = text.replace(/ඨ්‍යෝ/g, "fGHda");
    text = text.replace(/ශ්‍යෝ/g, "fYHda");
    text = text.replace(/ක්‍ෂ්‍යෝ/g, "fÌHda");
    text = text.replace(/බ්‍යෝ/g, "fnHda");
    text = text.replace(/ච්‍යෝ/g, "fpHda");
    text = text.replace(/ඩ්‍යෝ/g, "fâHda");
    text = text.replace(/ෆ්‍යෝ/g, "f*Hda");
    text = text.replace(/ග්‍යෝ/g, "f.Hda");
    text = text.replace(/ජ්‍යෝ/g, "fcHda");
    text = text.replace(/ක්‍යෝ/g, "flHda");
    text = text.replace(/ල්‍යෝ/g, "f,Hda");
    text = text.replace(/ම්‍යෝ/g, "fuHda");
    text = text.replace(/න්‍යෝ/g, "fkHda");
    text = text.replace(/ප්‍යෝ/g, "fmHda");
    text = text.replace(/ද්‍යෝ/g, "foHda");
    text = text.replace(/ස්‍යෝ/g, "fiHda");
    text = text.replace(/ට්‍යෝ/g, "fgHda");
    text = text.replace(/ව්‍යෝ/g, "fjHda");
    text = text.replace(/ත්‍යෝ/g, "f;Hda");
    text = text.replace(/භ්‍යෝ/g, "fNHda");
    text = text.replace(/ධ්‍යෝ/g, "fOHda");
    text = text.replace(/ථ්‍යෝ/g, "f:Hda");
    text = text.replace(/ෂ්‍යො/g, "fIHd");
    text = text.replace(/ශ්‍යො/g, "fYHd");
    text = text.replace(/ඛ්‍යො/g, "fLHd");
    text = text.replace(/ක්‍ෂ්‍යො/g, "fÌHd");
    text = text.replace(/බ්‍යො/g, "fnHd");
    text = text.replace(/ව්‍යො/g, "fjHd");
    text = text.replace(/ඩ්‍යො/g, "fvHd");
    text = text.replace(/ෆ්‍යො/g, "f*Hd");
    text = text.replace(/ග්‍යො/g, "f.Hd");
    text = text.replace(/ජ්‍යො/g, "fcHd");
    text = text.replace(/ක්‍යො/g, "flHd");
    text = text.replace(/ම්‍යො/g, "fuHd");
    text = text.replace(/ප්‍යො/g, "fmHd");
    text = text.replace(/ද්‍යො/g, "foHd");
    text = text.replace(/ස්‍යො/g, "fiHd");
    text = text.replace(/ට්‍යො/g, "fgHd");
    text = text.replace(/ව්‍යො/g, "fjHd");
    text = text.replace(/ත්‍යො/g, "f;Hd");
    text = text.replace(/ඛ්‍යෙ/g, "fLH");
    text = text.replace(/ක්‍ෂ්යෙ/g, "fÌH");
    text = text.replace(/බ්‍යෙ/g, "fnH");
    text = text.replace(/ඩ්‍යෙ/g, "fvH");
    text = text.replace(/ෆ්‍යෙ/g, "f*H");
    text = text.replace(/ග්‍යෙ/g, "f.H");
    text = text.replace(/ජ්‍යෙ/g, "fcH");
    text = text.replace(/ක්‍යෙ/g, "flH");
    text = text.replace(/ම්‍යෙ/g, "fuH");
    text = text.replace(/ප්‍යෙ/g, "fmH");
    text = text.replace(/ද්‍යෙ/g, "foH");
    text = text.replace(/ස්‍යෙ/g, "fiH");
    text = text.replace(/ට්‍යෙ/g, "fgH");
    text = text.replace(/ව්‍යෙ/g, "fjH");
    text = text.replace(/ත්‍යෙ/g, "f;H");
    text = text.replace(/භ්‍යෙ/g, "fNH");
    text = text.replace(/ධ්‍යෙ/g, "fOH");
    text = text.replace(/ථ්‍යෙ/g, "f:H");
    text = text.replace(/ෂ්‍රෝ/g, "fI%da");
    text = text.replace(/ඝ්‍රෝ/g, "f>%da");
    text = text.replace(/ශ්‍රෝ/g, "fY%da");
    text = text.replace(/ක්‍ෂ්‍රෝ/g, "fÌ%da");
    text = text.replace(/බ්‍රෝ/g, "fn%da");
    text = text.replace(/ඩ්‍රෝ/g, "fv%da");
    text = text.replace(/ෆ්‍රෝ/g, "f*%da");
    text = text.replace(/ග්‍රෝ/g, "f.%da");
    text = text.replace(/ක්‍රෝ/g, "fl%da");
    text = text.replace(/ප්‍රෝ/g, "fm%da");
    text = text.replace(/ද්‍රෝ/g, "føda");
    text = text.replace(/ස්‍රෝ/g, "fi%da");
    text = text.replace(/ට්‍රෝ/g, "fg%da");
    text = text.replace(/ත්‍රෝ/g, "f;%da");
    text = text.replace(/ශ්‍රො/g, "fY%d");
    text = text.replace(/ඩ්‍රො/g, "fv%d");
    text = text.replace(/ෆ්‍රො/g, "f*%d");
    text = text.replace(/ග්‍රො/g, "f.%d");
    text = text.replace(/ක්‍රො/g, "fl%d");
    text = text.replace(/ප්‍රො/g, "fm%d");
    text = text.replace(/ද්‍රො/g, "fød");
    text = text.replace(/ස්‍රො/g, "fi%d");
    text = text.replace(/ට්‍රො/g, "fg%d");
    text = text.replace(/ත්‍රො/g, "f;%d");
    text = text.replace(/ශ්‍රේ/g, "fYa%");
    text = text.replace(/බ්‍රේ/g, "fí%");
    text = text.replace(/ඩ්‍රේ/g, "fâ%");
    text = text.replace(/ෆ්‍රේ/g, "f*a%");
    text = text.replace(/ග්‍රේ/g, "f.a%");
    text = text.replace(/ක්‍රේ/g, "fla%");
    text = text.replace(/ප්‍රේ/g, "fma%");
    text = text.replace(/ද්‍රේ/g, "føa");
    text = text.replace(/ස්‍රේ/g, "fia%");
    text = text.replace(/ත්‍රේ/g, "f;a%");
    text = text.replace(/ධ්‍රේ/g, "fè%");
    text = text.replace(/ෂ්‍රෙ/g, "fI%");
    text = text.replace(/ශ්‍රෙ/g, "fY%");
    text = text.replace(/බ්‍රෙ/g, "fn%");
    text = text.replace(/ෆ්‍රෙ/g, "f*%");
    text = text.replace(/ග්‍රෙ/g, "f.%");
    text = text.replace(/ක්‍රෙ/g, "fl%");
    text = text.replace(/ප්‍රෙ/g, "fm%");
    text = text.replace(/ද්‍රෙ/g, "fø");
    text = text.replace(/ස්‍රෙ/g, "fi%");
    text = text.replace(/ත්‍රෙ/g, "f;%");
    text = text.replace(/භ්‍රෙ/g, "fN%");
    text = text.replace(/ධ්‍රෙ/g, "fO%");
    text = text.replace(/්‍ය/g, "H");
    text = text.replace(/්‍ර/g, "%");
    text = text.replace(/ෂෞ/g, "fI!");
    text = text.replace(/ඡෞ/g, "fP!");
    text = text.replace(/ශෞ/g, "fY!");
    text = text.replace(/බෞ/g, "fn!");
    text = text.replace(/චෞ/g, "fp!");
    text = text.replace(/ඩෞ/g, "fv!");
    text = text.replace(/ෆෞ/g, "f*!");
    text = text.replace(/ගෞ/g, "f.!");
    text = text.replace(/ජෞ/g, "fc!");
    text = text.replace(/කෞ/g, "fl!");
    text = text.replace(/ලෞ/g, "f,!");
    text = text.replace(/මෞ/g, "fu!");
    text = text.replace(/නෞ/g, "fk!");
    text = text.replace(/පෞ/g, "fm!");
    text = text.replace(/දෞ/g, "fo!");
    text = text.replace(/රෞ/g, "fr!");
    text = text.replace(/සෞ/g, "fi!");
    text = text.replace(/ටෞ/g, "fg!");
    text = text.replace(/තෞ/g, "f;!");
    text = text.replace(/භෞ/g, "fN!");
    text = text.replace(/ඤෞ/g, "f[!");
    text = text.replace(/ෂෝ/g, "fIda");
    text = text.replace(/ඹෝ/g, "fUda");
    text = text.replace(/ඡෝ/g, "fPda");
    text = text.replace(/ඪෝ/g, "fVda");
    text = text.replace(/ඝෝ/g, "f>da");
    text = text.replace(/ඛෝ/g, "fLda");
    text = text.replace(/ළෝ/g, "f<da");
    text = text.replace(/ඟෝ/g, "fÛda");
    text = text.replace(/ණෝ/g, "fKda");
    text = text.replace(/ඵෝ/g, "fMda");
    text = text.replace(/ඨෝ/g, "fGda");
    text = text.replace(/ඬෝ/g, "fËda");
    text = text.replace(/ශෝ/g, "fYda");
    text = text.replace(/ඥෝ/g, "f{da");
    text = text.replace(/ඳෝ/g, "f|da");
    text = text.replace(/ක්‍ෂෝ/g, "fÌda");
    text = text.replace(/බෝ/g, "fnda");
    text = text.replace(/චෝ/g, "fpda");
    text = text.replace(/ඩෝ/g, "fvda");
    text = text.replace(/ෆෝ/g, "f*da");
    text = text.replace(/ගෝ/g, "f.da");
    text = text.replace(/හෝ/g, "fyda");
    text = text.replace(/ජෝ/g, "fcda");
    text = text.replace(/කෝ/g, "flda");
    text = text.replace(/ලෝ/g, "f,da");
    text = text.replace(/මෝ/g, "fuda");
    text = text.replace(/නෝ/g, "fkda");
    text = text.replace(/පෝ/g, "fmda");
    text = text.replace(/දෝ/g, "foda");
    text = text.replace(/රෝ/g, "frda");
    text = text.replace(/සෝ/g, "fida");
    text = text.replace(/ටෝ/g, "fgda");
    text = text.replace(/වෝ/g, "fjda");
    text = text.replace(/තෝ/g, "f;da");
    text = text.replace(/භෝ/g, "fNda");
    text = text.replace(/යෝ/g, "fhda");
    text = text.replace(/ඤෝ/g, "f[da");
    text = text.replace(/ධෝ/g, "fOda");
    text = text.replace(/ථෝ/g, "f:da");
    text = text.replace(/ෂො/g, "fId");
    text = text.replace(/ඹො/g, "fUd");
    text = text.replace(/ඡො/g, "fPd");
    text = text.replace(/ඪො/g, "fVd");
    text = text.replace(/ඝො/g, "f>d");
    text = text.replace(/ඛො/g, "fLd");
    text = text.replace(/ළො/g, "f<d");
    text = text.replace(/ඟො/g, "fÕd");
    text = text.replace(/ණො/g, "fKd");
    text = text.replace(/ඵො/g, "fMd");
    text = text.replace(/ඨො/g, "fGd");
    text = text.replace(/ඬො/g, "fËd");
    text = text.replace(/ශො/g, "fYd");
    text = text.replace(/ඥො/g, "f{d");
    text = text.replace(/ඳො/g, "f|d");
    text = text.replace(/ක්‍ෂො/g, "fÌd");
    text = text.replace(/බො/g, "fnd");
    text = text.replace(/චො/g, "fpd");
    text = text.replace(/ඩො/g, "fvd");
    text = text.replace(/ෆො/g, "f*d");
    text = text.replace(/ගො/g, "f.d");
    text = text.replace(/හො/g, "fyd");
    text = text.replace(/ජො/g, "fcd");
    text = text.replace(/කො/g, "fld");
    text = text.replace(/ලො/g, "f,d");
    text = text.replace(/මො/g, "fud");
    text = text.replace(/නො/g, "fkd");
    text = text.replace(/පො/g, "fmd");
    text = text.replace(/දො/g, "fod");
    text = text.replace(/රො/g, "frd");
    text = text.replace(/සො/g, "fid");
    text = text.replace(/ටො/g, "fgd");
    text = text.replace(/වො/g, "fjd");
    text = text.replace(/තො/g, "f;d");
    text = text.replace(/භො/g, "fNd");
    text = text.replace(/යො/g, "fhd");
    text = text.replace(/ඤො/g, "f[d");
    text = text.replace(/ධො/g, "fOd");
    text = text.replace(/ථො/g, "f:d");
    text = text.replace(/ෂේ/g, "fIa");
    text = text.replace(/ඹේ/g, "fò");
    text = text.replace(/ඡේ/g, "fþ");
    text = text.replace(/ඪේ/g, "f\\a");
    text = text.replace(/ඝේ/g, "f>a");
    text = text.replace(/ඛේ/g, "fÄ");
    text = text.replace(/ළේ/g, "f<a");
    text = text.replace(/ඟේ/g, "fÛa");
    text = text.replace(/ණේ/g, "fKa");
    text = text.replace(/ඵේ/g, "fMa");
    text = text.replace(/ඨේ/g, "fGa");
    text = text.replace(/ඬේ/g, "få");
    text = text.replace(/ශේ/g, "fYa");
    text = text.replace(/ඥේ/g, "f{a");
    text = text.replace(/ඳේ/g, "f|a");
    text = text.replace(/ක්‍ෂේ/g, "fÌa");
    text = text.replace(/බේ/g, "fí");
    text = text.replace(/චේ/g, "fÉ");
    text = text.replace(/ඩේ/g, "fâ");
    text = text.replace(/ෆේ/g, "f*");
    text = text.replace(/ගේ/g, "f.a");
    text = text.replace(/හේ/g, "fya");
    text = text.replace(/පේ/g, "fma");
    text = text.replace(/කේ/g, "fla");
    text = text.replace(/ලේ/g, "f,a");
    text = text.replace(/මේ/g, "fï");
    text = text.replace(/නේ/g, "fka");
    text = text.replace(/ජේ/g, "f–");
    text = text.replace(/දේ/g, "foa");
    text = text.replace(/රේ/g, "f¾");
    text = text.replace(/සේ/g, "fia");
    text = text.replace(/ටේ/g, "fÜ");
    text = text.replace(/වේ/g, "fõ");
    text = text.replace(/තේ/g, "f;a");
    text = text.replace(/භේ/g, "fNa");
    text = text.replace(/යේ/g, "fha");
    text = text.replace(/ඤේ/g, "f[a");
    text = text.replace(/ධේ/g, "fè");
    text = text.replace(/ථේ/g, "f:a");
    text = text.replace(/ෂෙ/g, "fI");
    text = text.replace(/ඹෙ/g, "fU");
    text = text.replace(/ඓ/g, "ft");
    text = text.replace(/ඡෙ/g, "fP");
    text = text.replace(/ඪෙ/g, "fV");
    text = text.replace(/ඝෙ/g, "f>");
    text = text.replace(/ඛෙ/g, "fn");
    text = text.replace(/ළෙ/g, "f<");
    text = text.replace(/ඟෙ/g, "fÛ");
    text = text.replace(/ණෙ/g, "fK");
    text = text.replace(/ඵෙ/g, "fM");
    text = text.replace(/ඨෙ/g, "fG");
    text = text.replace(/ඬෙ/g, "fË");
    text = text.replace(/ශෙ/g, "fY");
    text = text.replace(/ඥෙ/g, "f{");
    text = text.replace(/ඳෙ/g, "fË");
    text = text.replace(/ක්‍ෂෙ/g, "fÌ");
    text = text.replace(/බෙ/g, "fn");
    text = text.replace(/චෙ/g, "fp");
    text = text.replace(/ඩෙ/g, "fv");
    text = text.replace(/ෆෙ/g, "f*");
    text = text.replace(/ගෙ/g, "f.");
    text = text.replace(/හෙ/g, "fy");
    text = text.replace(/ජෙ/g, "fc");
    text = text.replace(/කෙ/g, "fl");
    text = text.replace(/ලෙ/g, "f,");
    text = text.replace(/මෙ/g, "fu");
    text = text.replace(/නෙ/g, "fk");
    text = text.replace(/පෙ/g, "fm");
    text = text.replace(/දෙ/g, "fo");
    text = text.replace(/රෙ/g, "fr");
    text = text.replace(/සෙ/g, "fi");
    text = text.replace(/ටෙ/g, "fg");
    text = text.replace(/වෙ/g, "fj");
    text = text.replace(/තෙ/g, "f;");
    text = text.replace(/භෙ/g, "fN");
    text = text.replace(/යෙ/g, "fh");
    text = text.replace(/ඤෙ/g, "f[");
    text = text.replace(/ධෙ/g, "fO");
    text = text.replace(/ථෙ/g, "f:");
    text = text.replace(/තු/g, ";=");
    text = text.replace(/ගු/g, ".=");
    text = text.replace(/කු/g, "l=");
    text = text.replace(/තූ/g, ";+");
    text = text.replace(/ගූ/g, ".+");
    text = text.replace(/කූ/g, "l+");
    text = text.replace(/රු/g, "re");
    text = text.replace(/රූ/g, "rE");
    text = text.replace(/ආ/g, "wd");
    text = text.replace(/ඇ/g, "we");
    text = text.replace(/ඈ/g, "wE");
    text = text.replace(/ඌ/g, "W!");
    text = text.replace(/ඖ/g, "T!");
    text = text.replace(/ඒ/g, "ta");
    text = text.replace(/ඕ/g, "´");
    text = text.replace(/ඳි/g, "¢");
    text = text.replace(/ඳී/g, "£");
    text = text.replace(/දූ/g, "¥");
    text = text.replace(/දී/g, "§");
    text = text.replace(/ලූ/g, "¨");
    text = text.replace(/ර්‍ය/g, "©");
    text = text.replace(/ඳූ/g, "ª");
    text = text.replace(/ර්/g, "¾");
    text = text.replace(/ඨි/g, "À");
    text = text.replace(/ඨී/g, "Á");
    text = text.replace(/ඡී/g, "Â");
    text = text.replace(/ඛ්/g, "Ä");
    text = text.replace(/ඛි/g, "Å");
    text = text.replace(/ලු/g, "Æ");
    text = text.replace(/ඛී/g, "Ç");
    text = text.replace(/දි/g, "È");
    text = text.replace(/ච්/g, "É");
    text = text.replace(/ජ්/g, "Ê");
    text = text.replace(/රී/g, "Í");
    text = text.replace(/ඪී/g, "Î");
    text = text.replace(/ඪී/g, "Ð,");
    text = text.replace(/චි/g, "Ñ");
    text = text.replace(/ථී/g, "Ò");
    text = text.replace(/ථී/g, "Ó");
    text = text.replace(/ජී/g, "Ô");
    text = text.replace(/චී/g, "Ö");
    text = text.replace(/ඞ්/g, "Ù");
    text = text.replace(/ඵී/g, "Ú");
    text = text.replace(/ට්/g, "Ü");
    text = text.replace(/ඵි/g, "Ý");
    text = text.replace(/රි/g, "ß");
    text = text.replace(/ටී/g, "à");
    text = text.replace(/ටි/g, "á");
    text = text.replace(/ඩ්/g, "â");
    text = text.replace(/ඩී/g, "ã");
    text = text.replace(/ඩි/g, "ä");
    text = text.replace(/ඬ්/g, "å");
    text = text.replace(/ඬි/g, "ç");
    text = text.replace(/ධ්/g, "è");
    text = text.replace(/ඬී/g, "é");
    text = text.replace(/ධි/g, "ê");
    text = text.replace(/ධී/g, "ë");
    text = text.replace(/බි/g, "ì");
    text = text.replace(/බ්/g, "í");
    text = text.replace(/බී/g, "î");
    text = text.replace(/ම්/g, "ï");
    text = text.replace(/ජි/g, "ð");
    text = text.replace(/මි/g, "ñ");
    text = text.replace(/ඹ්/g, "ò");
    text = text.replace(/මී/g, "ó");
    text = text.replace(/ඹි/g, "ô");
    text = text.replace(/ව්/g, "õ");
    text = text.replace(/ඹී/g, "ö");
    text = text.replace(/ඳු/g, "÷");
    text = text.replace(/ද්‍ර/g, "ø");
    text = text.replace(/වී/g, "ù");
    text = text.replace(/වි/g, "ú");
    text = text.replace(/ඞ්/g, "û");
    text = text.replace(/ඞී/g, "ü");
    text = text.replace(/ඡි/g, "ý");
    text = text.replace(/ඡ්/g, "þ");
    text = text.replace(/දු/g, "ÿ");
    text = text.replace(/ජ්/g, "–");
    text = text.replace(/ර්‍ණ/g, "“");
    text = text.replace(/ණී/g, "”");
    text = text.replace(/ජී/g, "„");
    text = text.replace(/ඡි/g, "‰");
    text = text.replace(/ඩි/g, "");
    text = text.replace(/ඤු/g, "™");
    text = text.replace(/ග/g, ".");
    text = text.replace(/ළු/g, "¿");
    text = text.replace(/ෂ/g, "I");
    text = text.replace(/ං/g, "x");
    text = text.replace(/ඃ/g, "#");
    text = text.replace(/ඹ/g, "U");
    text = text.replace(/ඡ/g, "P");
    text = text.replace(/ඪ/g, "V");
    text = text.replace(/ඝ/g, ">");
    text = text.replace(/ඊ/g, "B");
    text = text.replace(/ඣ/g, "CO");
    text = text.replace(/ඛ/g, "L");
    text = text.replace(/ළ/g, "<");
    text = text.replace(/ඟ/g, "Û");
    text = text.replace(/ණ/g, "K");
    text = text.replace(/ඵ/g, "M");
    text = text.replace(/ඨ/g, "G");
    text = text.replace(/ඃ/g, "#");
    text = text.replace(/\"/g, ",");
    text = text.replace(/\//g, "$");
    text = text.replace(/\)/g, "&");
    text = text.replace(/:/g, "(");
    text = text.replace(/-/g, ")");
    text = text.replace(/ෆ/g, "*");
    text = text.replace(/ල/g, ",");
    text = text.replace(/-/g, "-");
    text = text.replace(/රැ/g, "/");
    text = text.replace(/ථ/g, ":");
    text = text.replace(/ත/g, ";");
    text = text.replace(/ළ/g, "<");
    text = text.replace(/ඝ/g, ">");
    text = text.replace(/රෑ/g, "?");
    text = text.replace(/ඊ/g, "B");
    text = text.replace(/ක‍/g, "C");
    text = text.replace(/‍ෘ/g, "D");
    text = text.replace(/ෑ/g, "E");
    text = text.replace(/ත‍/g, "F");
    text = text.replace(/ඨ/g, "G");
    text = text.replace(/්‍ය/g, "H");
    text = text.replace(/ෂ/g, "I");
    text = text.replace(/න‍/g, "J");
    text = text.replace(/ණ/g, "K");
    text = text.replace(/ඛ/g, "L");
    text = text.replace(/ඵ/g, "M");
    text = text.replace(/භ/g, "N");
    text = text.replace(/ධ/g, "O");
    text = text.replace(/ඡ/g, "P");
    text = text.replace(/ඍ/g, "R");
    text = text.replace(/ඔ/g, "T");
    text = text.replace(/ඹ/g, "U");
    text = text.replace(/ඪ/g, "V");
    text = text.replace(/උ/g, "W");
    text = text.replace(/ශ/g, "Y");
    text = text.replace(/ඤ/g, "[");
    text = text.replace(/ඉ/g, "b");
    text = text.replace(/ජ/g, "c");
    text = text.replace(/ට/g, "g");
    text = text.replace(/ය/g, "h");
    text = text.replace(/ස/g, "i");
    text = text.replace(/ව/g, "j");
    text = text.replace(/න/g, "k");
    text = text.replace(/ක/g, "l");
    text = text.replace(/ප/g, "m");
    text = text.replace(/බ/g, "n");
    text = text.replace(/ද/g, "o");
    text = text.replace(/ච/g, "p");
    text = text.replace(/ර/g, "r");
    text = text.replace(/එ/g, "t");
    text = text.replace(/ම/g, "u");
    text = text.replace(/ඩ/g, "v");
    text = text.replace(/අ/g, "w");
    text = text.replace(/හ/g, "y");
    text = text.replace(/ඥ/g, "{");
    text = text.replace(/ඳ/g, "|");
    text = text.replace(/ක්‍ෂ/g, "Ì");
    text = text.replace(/ැ/g, "e");
    text = text.replace(/ෑ/g, "E");
    text = text.replace(/ෙ/g, "f");
    text = text.replace(/ු/g, "q");
    text = text.replace(/ි/g, "s");
    text = text.replace(/ූ/g, "Q");
    text = text.replace(/ී/g, "S");
    text = text.replace(/ෘ/g, "D");
    text = text.replace(/ෲ/g, "DD");
    text = text.replace(/ෟ/g, "!");
    text = text.replace(/ා/g, "d");
    text = text.replace(/්/g, "a");
    text = text.replace(/￦/g, "\"");
    text = text.replace(/�/g, "'");
    text = text.replace(/￫/g, "^");
    text = text.replace(/￩/g, "&");
    text = text.replace(/ￔ/g, ")");
    text = text.replace(/ￓ/g, "@");
    text = text.replace(/ￒ/g, "`");
    text = text.replace(/ￏ/g, "}");
    text = text.replace(/ￎ/g, "~");
    text = text.replace(/\ￍ/g, "¤");
    text = text.replace(/\ￌ/g, "•");
    text = text.replace(/\ￊ/g, "›");
    text = text.replace(/\ﾶ/g, "∙");
    text = text.replace(/ￕ/g, "]");

    return text;
  }

  // ========================================================
  // 3. FM ABHAYA -> SINHALA UNICODE CONVERTER (PANDUKABHAYA)
  // ========================================================
  const fmRules = {"%a": "a%", "A": "a", "=": "q", "+": "Q", "s%": "%s", "S%": "%S"};
  const fmMappings = {"w": "අ", "b": "ඉ", "B": "ඊ", "W": "උ", "R": "ඍ", "Ì": "ඏ", "Ï": "ඐ", "t": "එ", "T": "ඔ", "´": "ඕ", "l": "ක", "L": "ඛ", ".": "ග", ">": "ඝ", "X": "ඞ", "Õ": "ඟ", "p": "ච", "P": "ඡ", "c": "ජ", "®": "ඣ", "[": "ඤ", "{": "ඥ", "g": "ට", "G": "ඨ", "v": "ඩ", "V": "ඪ", "K": "ණ", "~": "ඬ", ";": "ත", ":": "ථ", "o": "ද", "O": "ධ", "k": "න", "|": "ඳ", "m": "ප", "M": "ඵ", "n": "බ", "N": "භ", "u": "ම", "U": "ඹ", "h": "ය", "r": "ර", ",": "ල", "j": "ව", "Y": "ශ", "I": "ෂ", "i": "ස", "y": "හ", "<": "ළ", "¿": "ළු", "*": "ෆ", "Ë": "ක්‍ෂ", "†": "ත්‍ථ", "…": "ත්‍ව", "‡": "න්‍ද", "„": "ද්‍ව", "Š": "ද්‍ධ", "H": "්‍ය", "%": "්‍ර", "e": "ැ", "E": "ෑ", "q": "ු", "Q": "ූ", "s": "ි", "S": "ී", "!": "ෟ", "d": "ා", "a": "්", "x": "ං", "#": "ඃ", "D": "ෘ", "f": "ෙ", "\"": ",", "$": "/", "&": ")", "'": ".", "(": ":", ")": "*", "+": "ූ", "-": "-", "/": "රැ", "=": "ු", "?": "රෑ", "@": "?", "A": "්", "C": "ක්‍", "F": "ත්‍", "J": "න්‍", "Z": "’", "]": "%", "^": "(", "z": "‘", "}": "=", "¡": "•", "¢": "ඳි", "£": "ඳී", "¤": "–", "¦": ";", "§": "දී", "¨": "ලු", "ª": "ඳූ", "«": "×", "¬": "+", "­": "÷", "¯": "ඣි", "°": "ඣී", "±": "දැ", "²": "•", "³": "⋆", "µ": "i", "¶": "v", "¸": "I", "¹": "V", "º": "X", "½": "ඃ", "¾": "ර්", "À": "ඨි", "Á": "ඨී", "Â": "ඡී", "Ä": "ඛ්", "Å": "ඛි", "Æ": "ලූ", "Ç": "ඛී", "È": "දි", "É": "ච්", "Ê": "ජ්", "Í": "රී", "Î": "ඪි", "Ð": "ඪී", "Ñ": "චි", "Ò": "ථී", "Ó": "ථි", "Ô": "ජී", "Ö": "චී", "×": "ඥ", "Ø": "ඤ", "Ù": "ඞ්", "Ú": "ඵී", "Ü": "ට්", "Ý": "ඵි", "Þ": "දා", "ß": "රි", "à": "ටී", "á": "ටි", "â": "ඩ්", "ã": "ඞී", "ä": "ඩි", "å": "ඬ්", "æ": "!", "ç": "ඬි", "è": "ධ්", "é": "ඬී", "ê": "ධි", "ë": "ධී", "ì": "බි", "í": "බ්", "î": "බී", "ï": "ම්", "ð": "ජි", "ñ": "මි", "ò": "ඹ්", "ó": "මී", "ô": "ඹි", "õ": "ව්", "ö": "ඹී", "÷": "ඳු", "ø": "ද්‍ර", "ù": "වී", "ú": "වි", "û": "ඤු", "ü": "ඤූ", "ý": "ඡි", "þ": "ඡ්", "ÿ": "දු", "›": "ශ්‍රී", "ƒ": "ඳැ", "Œ": "ණී", "ˉ": "ඣි", "‚": "ණි", "“": "ර්‍ණ", "ˆ": "න්‍දා", "œ": "ර්‍්‍ය", "˜": "\"", "—": "\"", "™": "{", "∙": "×", "š": "}", "•": "x", "−": "÷", "‹": "ද්‍ධි", "‰": "ද්‍වි", "wd": "ආ", "we": "ඇ", "wE": "ඈ", "W!": "ඌ", "RD": "ඎ", "ta": "ඒ", "ft": "ඓ", "T!": "ඖ", "CO": "ඣ", "CI": "ක්‍ෂ", "Cj": "ක්‍ව", "JO": "න්‍ධ", "`.": "ඟ", "`P": "ඦ", "`v": "ඬ", "`o": "ඳ", "`j": "ද්‍ව", "`O": "ද්‍ධ", "`G": "ට්‍ඨ", "%s": "්‍රි", "%S": "්‍රී", " ’": "ී", " ‘": "ි", "DD": "ෲ", "ff": "ෛ", "ffl": "කෛ", "ffL": "ඛෛ", "ff.": "ගෛ", "ff>": "ඝෛ", "ffX": "ඞෛ", "ffÕ": "ඟෛ", "ffp": "චෛ", "ffP": "ඡෛ", "ffc": "ජෛ", "ffCO": "ඣෛ", "ff®": "ඣෛ", "ff[": "ඤෛ", "ff{": "ඥෛ", "ffg": "ටෛ", "ffG": "ඨෛ", "ffv": "ඩෛ", "ffV": "ඪෛ", "ffK": "ණෛ", "ff~": "ඬෛ", "ff;": "තෛ", "ff:": "ථෛ", "ffo": "දෛ", "ffO": "ධෛ", "ffk": "නෛ", "ff|": "ඳෛ", "ffm": "පෛ", "ffM": "ඵෛ", "ffn": "බෛ", "ffN": "භෛ", "ffu": "මෛ", "ffU": "ඹෛ", "ffh": "යෛ", "ffr": "රෛ", "ff,": "ලෛ", "ffj": "වෛ", "ffY": "ශෛ", "ffI": "ෂෛ", "ffi": "සෛ", "ffy": "හෛ", "ff<": "ළෛ", "ff*": "ෆෛ", "ff`.": "ඟෛ", "ff`P": "ඦෛ", "ff`v": "ඬෛ", "ff`o": "ඳෛ", "fft": "එෛ", "ff;%": "ත්‍රෛ", "fl%!": "ක්‍රෞ", "fL%!": "ඛ්‍රෞ", "f.%!": "ග්‍රෞ", "f>%!": "ඝ්‍රෞ", "fX%!": "ඞ්‍රෞ", "fÕ%!": "ඟ්‍රෞ", "fp%!": "ච්‍රෞ", "fP%!": "ඡ්‍රෞ", "fc%!": "ජ්‍රෞ", "fg%!": "ට්‍රෞ", "fG%!": "ඨ්‍රෞ", "fv%!": "ඩ්‍රෞ", "fV%!": "ඪ්‍රෞ", "f~%!": "ඬ්‍රෞ", "f;%!": "ත්‍රෞ", "f:%!": "ථ්‍රෞ", "fo%!": "ද්‍රෞ", "fO%!": "ධ්‍රෞ", "fk%!": "න්‍රෞ", "f|%!": "ඳ්‍රෞ", "fm%!": "ප්‍රෞ", "fM%!": "ඵ්‍රෞ", "fn%!": "බ්‍රෞ", "fN%!": "භ්‍රෞ", "fu%!": "ම්‍රෞ", "fU%!": "ඹ්‍රෞ", "fh%!": "ය්‍රෞ", "fj%!": "ව්‍රෞ", "fY%!": "ශ්‍රෞ", "fI%!": "ෂ්‍රෞ", "fi%!": "ස්‍රෞ", "fy%!": "හ්‍රෞ", "f<%!": "ළ්‍රෞ", "f*%!": "ෆ්‍රෞ", "f`.%!": "ඟ්‍රෞ", "f`P%!": "ඦ්‍රෞ", "f`v%!": "ඬ්‍රෞ", "f`o%!": "ඳ්‍රෞ", "flHda": "ක්‍යෝ", "fLHda": "ඛ්‍යෝ", "f.Hda": "ග්‍යෝ", "f>Hda": "ඝ්‍යෝ", "fXHda": "ඞ්‍යෝ", "fÕHda": "ඟ්‍යෝ", "fpHda": "ච්‍යෝ", "fPHda": "ඡ්‍යෝ", "fcHda": "ජ්‍යෝ", "fCOHda": "ඣ්‍යෝ", "f®Hda": "ඣ්‍යෝ", "f[Hda": "ඤ්‍යෝ", "f{Hda": "ඥ්‍යෝ", "fgHda": "ට්‍යෝ", "fGHda": "ඨ්‍යෝ", "fvHda": "ඩ්‍යෝ", "fVHda": "ඪ්‍යෝ", "fKHda": "ණ්‍යෝ", "f~Hda": "ඬ්‍යෝ", "f;Hda": "ත්‍යෝ", "f:Hda": "ථ්‍යෝ", "foHda": "ද්‍යෝ", "fOHda": "ධ්‍යෝ", "fkHda": "න්‍යෝ", "f|Hda": "ඳ්‍යෝ", "fmHda": "ප්‍යෝ", "fMHda": "ඵ්‍යෝ", "fnHda": "බ්‍යෝ", "fNHda": "භ්‍යෝ", "fuHda": "ම්‍යෝ", "fUHda": "ඹ්‍යෝ", "fhHda": "ය්‍යෝ", "frHda": "ර්‍යෝ", "f,Hda": "ල්‍යෝ", "fjHda": "ව්‍යෝ", "fYHda": "ශ්‍යෝ", "fIHda": "ෂ්‍යෝ", "fiHda": "ස්‍යෝ", "fyHda": "හ්‍යෝ", "f<Hda": "ළ්‍යෝ", "f*Hda": "ෆ්‍යෝ", "f`.Hda": "ඟ්‍යෝ", "f`PHda": "ඦ්‍යෝ", "f`vHda": "ඬ්‍යෝ", "f`oHda": "ඳ්‍යෝ", "fCIHda": "ක්‍ෂ්‍යෝ", "fCjHda": "ක්‍ව්‍යෝ", "fËHda": "ක්‍ෂ්‍යෝ", "f†Hda": "ත්‍ථ්‍යෝ", "f…Hda": "ත්‍ව්‍යෝ", "f‡Hda": "න්‍ද්‍යෝ", "fJOHda": "න්‍ධ්‍යෝ", "flHd": "ක්‍යො", "fLHd": "ඛ්‍යො", "f.Hd": "ග්‍යො", "f>Hd": "ඝ්‍යො", "fXHd": "ඞ්‍යො", "fÕHd": "ඟ්‍යො", "fpHd": "ච්‍යො", "fPHd": "ඡ්‍යො", "fcHd": "ජ්‍යො", "fCOHd": "ඣ්‍යො", "f®Hd": "ඣ්‍යො", "f[Hd": "ඤ්‍යො", "f{Hd": "ඥ්‍යො", "fgHd": "ට්‍යො", "fGHd": "ඨ්‍යො", "fvHd": "ඩ්‍යො", "fVHd": "ඪ්‍යො", "fKHd": "ණ්‍යො", "f~Hd": "ඬ්‍යො", "f;Hd": "ත්‍යො", "f:Hd": "ථ්‍යො", "foHd": "ද්‍යො", "fOHd": "ධ්‍යො", "fkHd": "න්‍යො", "f|Hd": "ඳ්‍යො", "fmHd": "ප්‍යො", "fMHd": "ඵ්‍යො", "fnHd": "බ්‍යො", "fNHd": "භ්‍යො", "fuHd": "ම්‍යො", "fUHd": "ඹ්‍යො", "fhHd": "ය්‍යො", "frHd": "ර්‍යො", "f,Hd": "ල්‍යො", "fjHd": "ව්‍යො", "fYHd": "ශ්‍යො", "fIHd": "ෂ්‍යො", "fiHd": "ස්‍යො", "fyHd": "හ්‍යො", "f<Hd": "ළ්‍යො", "f*Hd": "ෆ්‍යො", "f`.Hd": "ඟ්‍යො", "f`PHd": "ඦ්‍යො", "f`vHd": "ඬ්‍යො", "f`oHd": "ඳ්‍යො", "fCIHd": "ක්‍ෂ්‍යො", "fCjHd": "ක්‍ව්‍යො", "fËHd": "ක්‍ෂ්‍යො", "f†Hd": "ත්‍ථ්‍යො", "f…Hd": "ත්‍ව්‍යො", "f‡Hd": "න්‍ද්‍යො", "fJOHd": "න්‍ධ්‍යො", "flH": "ක්‍යෙ", "fLH": "ඛ්‍යෙ", "f.H": "ග්‍යෙ", "f>H": "ඝ්‍යෙ", "fXH": "ඞ්‍යෙ", "fÕH": "ඟ්‍යෙ", "fpH": "ච්‍යෙ", "fPH": "ඡ්‍යෙ", "fcH": "ජ්‍යෙ", "fCOH": "ඣ්‍යෙ", "f®H": "ඣ්‍යෙ", "f[H": "ඤ්‍යෙ", "f{H": "ඥ්‍යෙ", "fgH": "ට්‍යෙ", "fGH": "ඨ්‍යෙ", "fvH": "ඩ්‍යෙ", "fVH": "ඪ්‍යෙ", "fKH": "ණ්‍යෙ", "f~H": "ඬ්‍යෙ", "f;H": "ත්‍යෙ", "f:H": "ථ්‍යෙ", "foH": "ද්‍යෙ", "fOH": "ධ්‍යෙ", "fkH": "න්‍යෙ", "f|H": "ඳ්‍යෙ", "fmH": "ප්‍යෙ", "fMH": "ඵ්‍යෙ", "fnH": "බ්‍යෙ", "fNH": "භ්‍යෙ", "fuH": "ම්‍යෙ", "fUH": "ඹ්‍යෙ", "fhH": "ය්‍යෙ", "frH": "ර්‍යෙ", "f,H": "ල්‍යෙ", "fjH": "ව්‍යෙ", "fYH": "ශ්‍යෙ", "fIH": "ෂ්‍යෙ", "fiH": "ස්‍යෙ", "fyH": "හ්‍යෙ", "f<H": "ළ්‍යෙ", "f*H": "ෆ්‍යෙ", "f`.H": "ඟ්‍යෙ", "f`PH": "ඦ්‍යෙ", "f`vH": "ඬ්‍යෙ", "f`oH": "ඳ්‍යෙ", "fCIH": "ක්‍ෂ්‍යෙ", "fCjH": "ක්‍ව්‍යෙ", "fËH": "ක්‍ෂ්‍යෙ", "f†H": "ත්‍ථ්‍යෙ", "f…H": "ත්‍ව්‍යෙ", "f‡H": "න්‍ද්‍යෙ", "fJOH": "න්‍ධ්‍යෙ", "fl%da": "ක්‍රෝ", "fL%da": "ඛ්‍රෝ", "f.%da": "ග්‍රෝ", "f>%da": "ඝ්‍රෝ", "fX%da": "ඞ්‍රෝ", "fÕ%da": "ඟ්‍රෝ", "fp%da": "ච්‍රෝ", "fP%da": "ඡ්‍රෝ", "fc%da": "ජ්‍රෝ", "fCO%da": "ඣ්‍රෝ", "f®%da": "ඣ්‍රෝ", "f[%da": "ඤ්‍රෝ", "f{%da": "ඥ්‍රෝ", "fg%da": "ට්‍රෝ", "fG%da": "ඨ්‍රෝ", "fv%da": "ඩ්‍රෝ", "fV%da": "ඪ්‍රෝ", "f~%da": "ඬ්‍රෝ", "f;%da": "ත්‍රෝ", "f:%da": "ථ්‍රෝ", "fo%da": "ද්‍රෝ", "fO%da": "ධ්‍රෝ", "f|%da": "ඳ්‍රෝ", "fm%da": "ප්‍රෝ", "fM%da": "ඵ්‍රෝ", "fn%da": "බ්‍රෝ", "fN%da": "භ්‍රෝ", "fu%da": "ම්‍රෝ", "fU%da": "ඹ්‍රෝ", "fh%da": "ය්‍රෝ", "fj%da": "ව්‍රෝ", "fY%da": "ශ්‍රෝ", "fI%da": "ෂ්‍රෝ", "fi%da": "ස්‍රෝ", "fy%da": "හ්‍රෝ", "f<%da": "ළ්‍රෝ", "f*%da": "ෆ්‍රෝ", "f`.%da": "ඟ්‍රෝ", "f`P%da": "ඦ්‍රෝ", "f`v%da": "ඬ්‍රෝ", "f`o%da": "ඳ්‍රෝ", "fCI%da": "ක්‍ෂ්‍රෝ", "fCj%da": "ක්‍ව්‍රෝ", "fË%da": "ක්‍ෂ්‍රෝ", "f†%da": "ත්‍ථ්‍රෝ", "f…%da": "ත්‍ව්‍රෝ", "f‡%da": "න්‍ද්‍රෝ", "fJO%da": "න්‍ධ්‍රෝ", "føda": "ද්‍රෝ", "fl%d": "ක්‍රො", "fL%d": "ඛ්‍රො", "f.%d": "ග්‍රො", "f>%d": "ඝ්‍රො", "fX%d": "ඞ්‍රො", "fÕ%d": "ඟ්‍රො", "fp%d": "ච්‍රො", "fP%d": "ඡ්‍රො", "fc%d": "ජ්‍රො", "fCO%d": "ඣ්‍රො", "f®%d": "ඣ්‍රො", "f[%d": "ඤ්‍රො", "f{%d": "ඥ්‍රො", "fg%d": "ට්‍රො", "fG%d": "ඨ්‍රො", "fv%d": "ඩ්‍රො", "fV%d": "ඪ්‍රො", "f~%d": "ඬ්‍රො", "f;%d": "ත්‍රො", "f:%d": "ථ්‍රො", "fo%d": "ද්‍රො", "fO%d": "ධ්‍රො", "f|%d": "ඳ්‍රො", "fm%d": "ප්‍රො", "fM%d": "ඵ්‍රො", "fn%d": "බ්‍රො", "fN%d": "භ්‍රො", "fu%d": "ම්‍රො", "fU%d": "ඹ්‍රො", "fj%d": "ව්‍රො", "fY%d": "ශ්‍රො", "fI%d": "ෂ්‍රො", "fi%d": "ස්‍රො", "fy%d": "හ්‍රො", "f<%d": "ළ්‍රො", "f*%d": "ෆ්‍රො", "f`.%d": "ඟ්‍රො", "f`P%d": "ඦ්‍රො", "f`v%d": "ඬ්‍රො", "f`o%d": "ඳ්‍රො", "fød": "ද්‍රො", "fla%": "ක්‍රේ", "fLa%": "ඛ්‍රේ", "f.a%": "ග්‍රේ", "f>a%": "ඝ්‍රේ", "fXa%": "ඞ්‍රේ", "fÕa%": "ඟ්‍රේ", "fpa%": "ච්‍රේ", "fPa%": "ඡ්‍රේ", "fca%": "ජ්‍රේ", "fCOa%": "ඣ්‍රේ", "f®a%": "ඣ්‍රේ", "f[a%": "ඤ්‍රේ", "f{a%": "ඥ්‍රේ", "fga%": "ට්‍රේ", "fGa%": "ඨ්‍රේ", "fva%": "ඩ්‍රේ", "fVa%": "ඪ්‍රේ", "f~a%": "ඬ්‍රේ", "f;a%": "ත්‍රේ", "f:a%": "ථ්‍රේ", "foa%": "ද්‍රේ", "fOa%": "ධ්‍රේ", "f|a%": "ඳ්‍රේ", "fma%": "ප්‍රේ", "fMa%": "ඵ්‍රේ", "fna%": "බ්‍රේ", "fNa%": "භ්‍රේ", "fua%": "ම්‍රේ", "fUa%": "ඹ්‍රේ", "fja%": "ව්‍රේ", "fYa%": "ශ්‍රේ", "fIa%": "ෂ්‍රේ", "fia%": "ස්‍රේ", "fya%": "හ්‍රේ", "f<a%": "ළ්‍රේ", "f*a%": "ෆ්‍රේ", "f`.a%": "ඟ්‍රේ", "f`Pa%": "ඦ්‍රේ", "f`va%": "ඬ්‍රේ", "f`oa%": "ඳ්‍රේ", "fCIa%": "ක්‍ෂ්‍රේ", "fCja%": "ක්‍ව්‍රේ", "fËa%": "ක්‍ෂ්‍රේ", "f†a%": "ත්‍ථ්‍රේ", "f…a%": "ත්‍ව්‍රේ", "f‡a%": "න්‍ද්‍රේ", "fJOa%": "න්‍ධ්‍රේ", "føa": "ද්‍රේ", "fÄ%": "ඛ්‍රේ", "få%": "ඬ්‍රේ", "fí%": "බ්‍රේ", "fÉ%": "ච්‍රේ", "fâ%": "ඩ්‍රේ", "fï%": "ම්‍රේ", "fÜ%": "ට්‍රේ", "fõ%": "ව්‍රේ", "fè%": "ධ්‍රේ", "fl!": "කෞ", "fL!": "ඛෞ", "f.!": "ගෞ", "f>!": "ඝෞ", "fX!": "ඞෞ", "fÕ!": "ඟෞ", "fp!": "චෞ", "fP!": "ඡෞ", "fc!": "ජෞ", "fCO!": "ඣෞ", "f®!": "ඣෞ", "f[!": "ඤෞ", "f{!": "ඥෞ", "fg!": "ටෞ", "fG!": "ඨෞ", "fv!": "ඩෞ", "fV!": "ඪෞ", "fK!": "ණෞ", "f~!": "ඬෞ", "f;!": "තෞ", "f:!": "ථෞ", "fo!": "දෞ", "fO!": "ධෞ", "fk!": "නෞ", "f|!": "ඳෞ", "fm!": "පෞ", "fM!": "ඵෞ", "fn!": "බෞ", "fN!": "භෞ", "fu!": "මෞ", "fU!": "ඹෞ", "fh!": "යෞ", "fr!": "රෞ", "f,!": "ලෞ", "fj!": "වෞ", "fY!": "ශෞ", "fI!": "ෂෞ", "fi!": "සෞ", "fy!": "හෞ", "f<!": "ළෞ", "f*!": "ෆෞ", "f`.!": "ඟෞ", "f`P!": "ඦෞ", "f`v!": "ඬෞ", "f`o!": "ඳෞ", "flda": "කෝ", "fLda": "ඛෝ", "f.da": "ගෝ", "f>da": "ඝෝ", "fXda": "ඞෝ", "fÕda": "ඟෝ", "fpda": "චෝ", "fPda": "ඡෝ", "fcda": "ජෝ", "fCOda": "ඣෝ", "f®da": "ඣෝ", "f[da": "ඤෝ", "f{da": "ඥෝ", "fgda": "ටෝ", "fGda": "ඨෝ", "fvda": "ඩෝ", "fVda": "ඪෝ", "fKda": "ණෝ", "f~da": "ඬෝ", "f;da": "තෝ", "f:da": "ථෝ", "foda": "දෝ", "fOda": "ධෝ", "fkda": "නෝ", "f|da": "ඳෝ", "fmda": "පෝ", "fMda": "ඵෝ", "fnda": "බෝ", "fNda": "භෝ", "fuda": "මෝ", "fUda": "ඹෝ", "fhda": "යෝ", "frda": "රෝ", "f,da": "ලෝ", "fjda": "වෝ", "fYda": "ශෝ", "fIda": "ෂෝ", "fida": "සෝ", "fyda": "හෝ", "f<da": "ළෝ", "f*da": "ෆෝ", "f`.da": "ඟෝ", "f`Pda": "ඦෝ", "f`vda": "ඬෝ", "f`oda": "ඳෝ", "fld": "කො", "fLd": "ඛො", "f.d": "ගො", "f>d": "ඝො", "fXd": "ඞො", "fÕd": "ඟො", "fpd": "චො", "fPd": "ඡො", "fcd": "ජො", "fCOd": "ඣො", "f®d": "ඣො", "f[d": "ඤො", "f{d": "ඥො", "fgd": "ටො", "fGd": "ඨො", "fvd": "ඩො", "fVd": "ඪො", "fKd": "ණො", "f~d": "ඬො", "f;d": "තො", "f:d": "ථො", "fod": "දො", "fOd": "ධො", "fkd": "නො", "f|d": "ඳො", "fmd": "පො", "fMd": "ඵො", "fnd": "බො", "fNd": "භො", "fud": "මො", "fUd": "ඹො", "fhd": "යො", "frd": "රො", "f,d": "ලො", "fjd": "වො", "fYd": "ශො", "fId": "ෂො", "fid": "සො", "fyd": "හො", "f<d": "ළො", "f*d": "ෆො", "f`.d": "ඟො", "f`Pd": "ඦො", "f`vd": "ඬො", "f`od": "ඳො", "fla": "කේ", "fLa": "ඛේ", "f.a": "ගේ", "f>a": "ඝේ", "fXa": "ඞේ", "fÕa": "ඟේ", "fpa": "චේ", "fPa": "ඡේ", "fca": "ජේ", "fCOa": "ඣේ", "f®a": "ඣේ", "f[a": "ඤේ", "f{a": "ඥේ", "fga": "ටේ", "fGa": "ඨේ", "fva": "ඩේ", "fVa": "ඪේ", "fKa": "ණේ", "f~a": "ඬේ", "f;a": "තේ", "f:a": "ථේ", "foa": "දේ", "fOa": "ධේ", "fka": "නේ", "f|a": "ඳේ", "fma": "පේ", "fMa": "ඵේ", "fna": "බේ", "fNa": "භේ", "fua": "මේ", "fUa": "ඹේ", "fha": "යේ", "fra": "රේ", "f,a": "ලේ", "fja": "වේ", "fYa": "ශේ", "fIa": "ෂේ", "fia": "සේ", "fya": "හේ", "f<a": "ළේ", "f*a": "ෆේ", "f`.a": "ඟේ", "f`Pa": "ඦේ", "f`va": "ඬේ", "f`oa": "ඳේ", "fCIa": "ක්‍ෂේ", "fCja": "ක්‍වේ", "fËa": "ක්‍ෂේ", "f†a": "ත්‍ථේ", "f…a": "ත්‍වේ", "f‡a": "න්‍දේ", "fJOa": "න්‍ධේ", "fÄ": "ඛේ", "få": "ඬේ", "fí": "බේ", "fÉ": "චේ", "fâ": "ඩේ", "fï": "මේ", "fÜ": "ටේ", "fõ": "වේ", "fè": "ධේ", "fò": "ඹේ", "f¾": "රේ", "fÊ": "ජේ", "fl": "කෙ", "fL": "ඛෙ", "f.": "ගෙ", "f>": "ඝෙ", "fX": "ඞෙ", "fÕ": "ඟෙ", "fp": "චෙ", "fP": "ඡෙ", "fc": "ජෙ", "fCO": "ඣෙ", "f®": "ඣෙ", "f[": "ඤෙ", "f{": "ඥෙ", "fg": "ටෙ", "fG": "ඨෙ", "fv": "ඩෙ", "fV": "ඪෙ", "fK": "ණෙ", "f~": "ඬෙ", "f;": "තෙ", "f:": "ථෙ", "fo": "දෙ", "fO": "ධෙ", "fk": "නෙ", "f|": "ඳෙ", "fm": "පෙ", "fM": "ඵෙ", "fn": "බෙ", "fN": "භෙ", "fu": "මෙ", "fU": "ඹෙ", "fh": "යෙ", "fr": "රෙ", "f,": "ලෙ", "fj": "වෙ", "fY": "ශෙ", "fI": "ෂෙ", "fi": "සෙ", "fy": "හෙ", "f<": "ළෙ", "f*": "ෆෙ", "f`.": "ඟෙ", "f`P": "ඦෙ", "f`v": "ඬෙ", "f`o": "ඳෙ", "fCI": "ක්‍ෂෙ", "fCj": "ක්‍වෙ", "fË": "ක්‍ෂෙ", "f†": "ත්‍ථෙ", "f…": "ත්‍වෙ", "f‡": "න්‍දෙ", "fJO": "න්‍ධෙ", "lDD": "කෲ", "LDD": "ඛෲ", ".DD": "ගෲ", ">DD": "ඝෲ", "XDD": "ඞෲ", "ÕDD": "ඟෲ", "pDD": "චෲ", "PDD": "ඡෲ", "cDD": "ජෲ", "CODD": "ඣෲ", "®DD": "ඣෲ", "[DD": "ඤෲ", "{DD": "ඥෲ", "gDD": "ටෲ", "GDD": "ඨෲ", "vDD": "ඩෲ", "VDD": "ඪෲ", "KDD": "ණෲ", "~DD": "ඬෲ", ";DD": "තෲ", ":DD": "ථෲ", "oDD": "දෲ", "ODD": "ධෲ", "kDD": "නෲ", "|DD": "ඳෲ", "mDD": "පෲ", "MDD": "ඵෲ", "nDD": "බෲ", "NDD": "භෲ", "uDD": "මෲ", "UDD": "ඹෲ", "hDD": "යෲ", "rDD": "රෲ", ",DD": "ලෲ", "jDD": "වෲ", "YDD": "ශෲ", "IDD": "ෂෲ", "iDD": "සෲ", "yDD": "හෲ", "<DD": "ළෲ", "¿DD": "ළුෲ", "*DD": "ෆෲ", "`.DD": "ඟෲ", "`PDD": "ඦෲ", "`vDD": "ඬෲ", "`oDD": "ඳෲ", "l%s": "ක්‍රි", "L%s": "ඛ්‍රි", ".%s": "ග්‍රි", ">%s": "ඝ්‍රි", "X%s": "ඞ්‍රි", "Õ%s": "ඟ්‍රි", "p%s": "ච්‍රි", "P%s": "ඡ්‍රි", "c%s": "ජ්‍රි", "CO%s": "ඣ්‍රි", "®%s": "ඣ්‍රි", "[%s": "ඤ්‍රි", "{%s": "ඥ්‍රි", "g%s": "ට්‍රි", "G%s": "ඨ්‍රි", "v%s": "ඩ්‍රි", "V%s": "ඪ්‍රි", "K%s": "ණ්‍රි", "~%s": "ඬ්‍රි", ";%s": "ත්‍රි", ":%s": "ථ්‍රි", "o%s": "ද්‍රි", "O%s": "ධ්‍රි", "k%s": "න්‍රි", "|%s": "ඳ්‍රි", "m%s": "ප්‍රි", "M%s": "ඵ්‍රි", "n%s": "බ්‍රි", "N%s": "භ්‍රි", "u%s": "ම්‍රි", "U%s": "ඹ්‍රි", "h%s": "ය්‍රි", "r%s": "ර්‍රි", ",%s": "ල්‍රි", "j%s": "ව්‍රි", "Y%s": "ශ්‍රි", "I%s": "ෂ්‍රි", "i%s": "ස්‍රි", "y%s": "හ්‍රි", "<%s": "ළ්‍රි", "*%s": "ෆ්‍රි", "`.%s": "ඟ්‍රි", "`P%s": "ඦ්‍රි", "`v%s": "ඬ්‍රි", "`o%s": "ඳ්‍රි", "Ñ%": "ච්‍රි", "ê%": "ධ්‍රි", "ú%": "ව්‍රි", "ì%": "බ්‍රි", "á%": "ට්‍රි", "ñ%": "ම්‍රි", "ä%": "ඩ්‍රි", "ô%": "ඹ්‍රි", "Å%": "ඛ්‍රි", "ç%": "ඬ්‍රි", "l%S": "ක්‍රී", "L%S": "ඛ්‍රී", ".%S": "ග්‍රී", ">%S": "ඝ්‍රී", "X%S": "ඞ්‍රී", "Õ%S": "ඟ්‍රී", "p%S": "ච්‍රී", "P%S": "ඡ්‍රී", "c%S": "ජ්‍රී", "CO%S": "ඣ්‍රී", "®%S": "ඣ්‍රී", "[%S": "ඤ්‍රී", "{%S": "ඥ්‍රී", "g%S": "ට්‍රී", "G%S": "ඨ්‍රී", "v%S": "ඩ්‍රී", "V%S": "ඪ්‍රී", "K%S": "ණ්‍රී", "~%S": "ඬ්‍රී", ";%S": "ත්‍රී", ":%S": "ථ්‍රී", "o%S": "ද්‍රී", "O%S": "ධ්‍රී", "k%S": "න්‍රී", "|%S": "ඳ්‍රී", "m%S": "ප්‍රී", "M%S": "ඵ්‍රී", "n%S": "බ්‍රී", "N%S": "භ්‍රී", "u%S": "ම්‍රී", "U%S": "ඹ්‍රී", "h%S": "ය්‍රී", "r%S": "ර්‍රී", ",%S": "ල්‍රී", "j%S": "ව්‍රී", "Y%S": "ශ්‍රී", "I%S": "ෂ්‍රී", "i%S": "ස්‍රී", "y%S": "හ්‍රී", "<%S": "ළ්‍රී", "*%S": "ෆ්‍රී", "`.%S": "ඟ්‍රී", "`P%S": "ඦ්‍රී", "`v%S": "ඬ්‍රී", "`o%S": "ඳ්‍රී", "Ö%": "ච්‍රී", "ë%": "ධ්‍රී", "ù%": "ව්‍රී", "î%": "බ්‍රී", "à%": "ට්‍රී", "ó%": "ම්‍රී", "ã%": "ඩ්‍රී", "ö%": "ඹ්‍රී", "Ç%": "ඛ්‍රී", "é%": "ඬ්‍රී", "fl%": "ක්‍රෙ", "fL%": "ඛ්‍රෙ", "f.%": "ග්‍රෙ", "f>%": "ඝ්‍රෙ", "fX%": "ඞ්‍රෙ", "fÕ%": "ඟ්‍රෙ", "fp%": "ච්‍රෙ", "fP%": "ඡ්‍රෙ", "fc%": "ජ්‍රෙ", "fCO%": "ඣ්‍රෙ", "f®%": "ඣ්‍රෙ", "f[%": "ඤ්‍රෙ", "f{%": "ඥ්‍රෙ", "fg%": "ට්‍රෙ", "fG%": "ඨ්‍රෙ", "fv%": "ඩ්‍රෙ", "fV%": "ඪ්‍රෙ", "f~%": "ඬ්‍රෙ", "f;%": "ත්‍රෙ", "f:%": "ථ්‍රෙ", "fo%": "ද්‍රෙ", "fO%": "ධ්‍රෙ", "f|%": "ඳ්‍රෙ", "fm%": "ප්‍රෙ", "fM%": "ඵ්‍රෙ", "fn%": "බ්‍රෙ", "fN%": "භ්‍රෙ", "fu%": "ම්‍රෙ", "fU%": "ඹ්‍රෙ", "fj%": "ව්‍රෙ", "fY%": "ශ්‍රෙ", "fI%": "ෂ්‍රෙ", "fi%": "ස්‍රෙ", "fy%": "හ්‍රෙ", "f<%": "ළ්‍රෙ", "f*%": "ෆ්‍රෙ", "f`.%": "ඟ්‍රෙ", "f`P%": "ඦ්‍රෙ", "f`v%": "ඬ්‍රෙ", "f`o%": "ඳ්‍රෙ", "fø": "ද්‍රෙ", "l_": "ර්‍ක", "L_": "ර්‍ඛ", "._": "ර්‍ග", ">_": "ර්‍ඝ", "X_": "ර්‍ඞ", "Õ_": "ර්‍ඟ", "p_": "ර්‍ච", "P_": "ර්‍ඡ", "c_": "ර්‍ජ", "CO_": "ර්‍ඣ", "®_": "ර්‍ඣ", "[_": "ර්‍ඤ", "{_": "ර්‍ඥ", "g_": "ර්‍ට", "G_": "ර්‍ඨ", "v_": "ර්‍ඩ", "V_": "ර්‍ඪ", "K_": "ර්‍ණ", "~_": "ර්‍ඬ", ";_": "ර්‍ත", ":_": "ර්‍ථ", "o_": "ර්‍ද", "O_": "ර්‍ධ", "k_": "ර්‍න", "|_": "ර්‍ඳ", "m_": "ර්‍ප", "M_": "ර්‍ඵ", "n_": "ර්‍බ", "N_": "ර්‍භ", "u_": "ර්‍ම", "U_": "ර්‍ඹ", "h_": "ර්‍ය", ",_": "ර්‍ල", "j_": "ර්‍ව", "Y_": "ර්‍ශ", "I_": "ර්‍ෂ", "i_": "ර්‍ස", "y_": "ර්‍හ", "<_": "ර්‍ළ", "*_": "ර්‍ෆ", "`._": "ර්‍ඟ", "`P_": "ර්‍ඦ", "`v_": "ර්‍ඬ", "`o_": "ර්‍ඳ", "lH_": "ර්‍ක්‍ය", "LH_": "ර්‍ඛ්‍ය", ".H_": "ර්‍ග්‍ය", ">H_": "ර්‍ඝ්‍ය", "XH_": "ර්‍ඞ්‍ය", "ÕH_": "ර්‍ඟ්‍ය", "pH_": "ර්‍ච්‍ය", "PH_": "ර්‍ඡ්‍ය", "cH_": "ර්‍ජ්‍ය", "COH_": "ර්‍ඣ්‍ය", "®H_": "ර්‍ඣ්‍ය", "[H_": "ර්‍ඤ්‍ය", "{H_": "ර්‍ඥ්‍ය", "gH_": "ර්‍ට්‍ය", "GH_": "ර්‍ඨ්‍ය", "vH_": "ර්‍ඩ්‍ය", "VH_": "ර්‍ඪ්‍ය", "KH_": "ර්‍ණ්‍ය", "~H_": "ර්‍ඬ්‍ය", ";H_": "ර්‍ත්‍ය", ":H_": "ර්‍ථ්‍ය", "oH_": "ර්‍ද්‍ය", "OH_": "ර්‍ධ්‍ය", "kH_": "ර්‍න්‍ය", "|H_": "ර්‍ඳ්‍ය", "mH_": "ර්‍ප්‍ය", "MH_": "ර්‍ඵ්‍ය", "nH_": "ර්‍බ්‍ය", "NH_": "ර්‍භ්‍ය", "uH_": "ර්‍ම්‍ය", "UH_": "ර්‍ඹ්‍ය", "hH_": "ර්‍ය්‍ය", ",H_": "ර්‍ල්‍ය", "jH_": "ර්‍ව්‍ය", "YH_": "ර්‍ශ්‍ය", "IH_": "ර්‍ෂ්‍ය", "iH_": "ර්‍ස්‍ය", "yH_": "ර්‍හ්‍ය", "<H_": "ර්‍ළ්‍ය", "*H_": "ර්‍ෆ්‍ය", "`.H_": "ර්‍ඟ්‍ය", "`PH_": "ර්‍ඦ්‍ය", "`vH_": "ර්‍ඬ්‍ය", "`oH_": "ර්‍ඳ්‍ය", "f\\a": "ඳෝ", "f\\": "ඳො", "rE": "රූ", "re": "රු", "`ÿ": "ඳු", "`¥": "ඳූ", "`ê": "ද්‍ධි", "`ú": "ද්‍වි", "`È": "ඳි"};
  
  // Sorted regex keys for greedy prefix matching
  const fmKeys = ["fCOHda", "f`.Hda", "f`PHda", "f`vHda", "f`oHda", "fCIHda", "fCjHda", "fJOHda", "fCO%da", "f`.%da", "f`P%da", "f`v%da", "f`o%da", "fCI%da", "fCj%da", "fJO%da", "f`.%!", "f`P%!", "f`v%!", "f`o%!", "flHda", "fLHda", "f.Hda", "f>Hda", "fXHda", "fÕHda", "fpHda", "fPHda", "fcHda", "f®Hda", "f[Hda", "f{Hda", "fgHda", "fGHda", "fvHda", "fVHda", "fKHda", "f~Hda", "f;Hda", "f:Hda", "foHda", "fOHda", "fkHda", "f|Hda", "fmHda", "fMHda", "fnHda", "fNHda", "fuHda", "fUHda", "fhHda", "frHda", "f,Hda", "fjHda", "fYHda", "fIHda", "fiHda", "fyHda", "f<Hda", "f*Hda", "fËHda", "f†Hda", "f…Hda", "f‡Hda", "fCOHd", "f`.Hd", "f`PHd", "f`vHd", "f`oHd", "fCIHd", "fCjHd", "fJOHd", "fl%da", "fL%da", "f.%da", "f>%da", "fX%da", "fÕ%da", "fp%da", "fP%da", "fc%da", "f®%da", "f[%da", "f{%da", "fg%da", "fG%da", "fv%da", "fV%da", "f~%da", "f;%da", "f:%da", "fo%da", "fO%da", "f|%da", "fm%da", "fM%da", "fn%da", "fN%da", "fu%da", "fU%da", "fh%da", "fj%da", "fY%da", "fI%da", "fi%da", "fy%da", "f<%da", "f*%da", "fË%da", "f†%da", "f…%da", "f‡%da", "fCO%d", "f`.%d", "f`P%d", "f`v%d", "f`o%d", "fCOa%", "f`.a%", "f`Pa%", "f`va%", "f`oa%", "fCIa%", "fCja%", "fJOa%", "fCOda", "f`.da", "f`Pda", "f`vda", "f`oda", "ffCO", "ff`.", "ff`P", "ff`v", "ff`o", "ff;%", "fl%!", "fL%!", "f.%!", "f>%!", "fX%!", "fÕ%!", "fp%!", "fP%!", "fc%!", "fg%!", "fG%!", "fv%!", "fV%!", "f~%!", "f;%!", "f:%!", "fo%!", "fO%!", "fk%!", "f|%!", "fm%!", "fM%!", "fn%!", "fN%!", "fu%!", "fU%!", "fh%!", "fj%!", "fY%!", "fI%!", "fi%!", "fy%!", "f<%!", "f*%!", "flHd", "fLHd", "f.Hd", "f>Hd", "fXHd", "fÕHd", "fpHd", "fPHd", "fcHd", "f®Hd", "f[Hd", "f{Hd", "fgHd", "fGHd", "fvHd", "fVHd", "fKHd", "f~Hd", "f;Hd", "f:Hd", "foHd", "fOHd", "fkHd", "f|Hd", "fmHd", "fMHd", "fnHd", "fNHd", "fuHd", "fUHd", "fhHd", "frHd", "f,Hd", "fjHd", "fYHd", "fIHd", "fiHd", "fyHd", "f<Hd", "f*Hd", "fËHd", "f†Hd", "f…Hd", "f‡Hd", "fCOH", "f`.H", "f`PH", "f`vH", "f`oH", "fCIH", "fCjH", "fJOH", "føda", "fl%d", "fL%d", "f.%d", "f>%d", "fX%d", "fÕ%d", "fp%d", "fP%d", "fc%d", "f®%d", "f[%d", "f{%d", "fg%d", "fG%d", "fv%d", "fV%d", "f~%d", "f;%d", "f:%d", "fo%d", "fO%d", "f|%d", "fm%d", "fM%d", "fn%d", "fN%d", "fu%d", "fU%d", "fj%d", "fY%d", "fI%d", "fi%d", "fy%d", "f<%d", "f*%d", "fla%", "fLa%", "f.a%", "f>a%", "fXa%", "fÕa%", "fpa%", "fPa%", "fca%", "f®a%", "f[a%", "f{a%", "fga%", "fGa%", "fva%", "fVa%", "f~a%", "f;a%", "f:a%", "foa%", "fOa%", "f|a%", "fma%", "fMa%", "fna%", "fNa%", "fua%", "fUa%", "fja%", "fYa%", "fIa%", "fia%", "fya%", "f<a%", "f*a%", "fËa%", "f†a%", "f…a%", "f‡a%", "fCO!", "f`.!", "f`P!", "f`v!", "f`o!", "flda", "fLda", "f.da", "f>da", "fXda", "fÕda", "fpda", "fPda", "fcda", "f®da", "f[da", "f{da", "fgda", "fGda", "fvda", "fVda", "fKda", "f~da", "f;da", "f:da", "foda", "fOda", "fkda", "f|da", "fmda", "fMda", "fnda", "fNda", "fuda", "fUda", "fhda", "frda", "f,da", "fjda", "fYda", "fIda", "fida", "fyda", "f<da", "f*da", "fCOd", "f`.d", "f`Pd", "f`vd", "f`od", "fCOa", "f`.a", "f`Pa", "f`va", "f`oa", "fCIa", "fCja", "fJOa", "CODD", "`.DD", "`PDD", "`vDD", "`oDD", "CO%s", "`.%s", "`P%s", "`v%s", "`o%s", "CO%S", "`.%S", "`P%S", "`v%S", "`o%S", "fCO%", "f`.%", "f`P%", "f`v%", "f`o%", "COH_", "`.H_", "`PH_", "`vH_", "`oH_", "ffl", "ffL", "ff.", "ff>", "ffX", "ffÕ", "ffp", "ffP", "ffc", "ff®", "ff[", "ff{", "ffg", "ffG", "ffv", "ffV", "ffK", "ff~", "ff;", "ff:", "ffo", "ffO", "ffk", "ff|", "ffm", "ffM", "ffn", "ffN", "ffu", "ffU", "ffh", "ffr", "ff,", "ffj", "ffY", "ffI", "ffi", "ffy", "ff<", "ff*", "fft", "flH", "fLH", "f.H", "f>H", "fXH", "fÕH", "fpH", "fPH", "fcH", "f®H", "f[H", "f{H", "fgH", "fGH", "fvH", "fVH", "fKH", "f~H", "f;H", "f:H", "foH", "fOH", "fkH", "f|H", "fmH", "fMH", "fnH", "fNH", "fuH", "fUH", "fhH", "frH", "f,H", "fjH", "fYH", "fIH", "fiH", "fyH", "f<H", "f*H", "fËH", "f†H", "f…H", "f‡H", "fød", "føa", "fÄ%", "få%", "fí%", "fÉ%", "fâ%", "fï%", "fÜ%", "fõ%", "fè%", "fl!", "fL!", "f.!", "f>!", "fX!", "fÕ!", "fp!", "fP!", "fc!", "f®!", "f[!", "f{!", "fg!", "fG!", "fv!", "fV!", "fK!", "f~!", "f;!", "f:!", "fo!", "fO!", "fk!", "f|!", "fm!", "fM!", "fn!", "fN!", "fu!", "fU!", "fh!", "fr!", "f,!", "fj!", "fY!", "fI!", "fi!", "fy!", "f<!", "f*!", "fld", "fLd", "f.d", "f>d", "fXd", "fÕd", "fpd", "fPd", "fcd", "f®d", "f[d", "f{d", "fgd", "fGd", "fvd", "fVd", "fKd", "f~d", "f;d", "f:d", "fod", "fOd", "fkd", "f|d", "fmd", "fMd", "fnd", "fNd", "fud", "fUd", "fhd", "frd", "f,d", "fjd", "fYd", "fId", "fid", "fyd", "f<d", "f*d", "fla", "fLa", "f.a", "f>a", "fXa", "fÕa", "fpa", "fPa", "fca", "f®a", "f[a", "f{a", "fga", "fGa", "fva", "fVa", "fKa", "f~a", "f;a", "f:a", "foa", "fOa", "fka", "f|a", "fma", "fMa", "fna", "fNa", "fua", "fUa", "fha", "fra", "f,a", "fja", "fYa", "fIa", "fia", "fya", "f<a", "f*a", "fËa", "f†a", "f…a", "f‡a", "fCO", "f`.", "f`P", "f`v", "f`o", "fCI", "fCj", "fJO", "lDD", "LDD", ".DD", ">DD", "XDD", "ÕDD", "pDD", "PDD", "cDD", "®DD", "[DD", "{DD", "gDD", "GDD", "vDD", "VDD", "KDD", "~DD", ";DD", ":DD", "oDD", "ODD", "kDD", "|DD", "mDD", "MDD", "nDD", "NDD", "uDD", "UDD", "hDD", "rDD", ",DD", "jDD", "YDD", "IDD", "iDD", "yDD", "<DD", "¿DD", "*DD", "l%s", "L%s", ".%s", ">%s", "X%s", "Õ%s", "p%s", "P%s", "c%s", "®%s", "[%s", "{%s", "g%s", "G%s", "v%s", "V%s", "K%s", "~%s", ";%s", ":%s", "o%s", "O%s", "k%s", "|%s", "m%s", "M%s", "n%s", "N%s", "u%s", "U%s", "h%s", "r%s", ",%s", "j%s", "Y%s", "I%s", "i%s", "y%s", "<%s", "*%s", "l%S", "L%S", ".%S", ">%S", "X%S", "Õ%S", "p%S", "P%S", "c%S", "®%S", "[%S", "{%S", "g%S", "G%S", "v%S", "V%S", "K%S", "~%S", ";%S", ":%S", "o%S", "O%S", "k%S", "|%S", "m%S", "M%S", "n%S", "N%S", "u%S", "U%S", "h%S", "r%S", ",%S", "j%S", "Y%S", "I%S", "i%S", "y%S", "<%S", "*%S", "fl%", "fL%", "f.%", "f>%", "fX%", "fÕ%", "fp%", "fP%", "fc%", "f®%", "f[%", "f{%", "fg%", "fG%", "fv%", "fV%", "f~%", "f;%", "f:%", "fo%", "fO%", "f|%", "fm%", "fM%", "fn%", "fN%", "fu%", "fU%", "fj%", "fY%", "fI%", "fi%", "fy%", "f<%", "f*%", "CO_", "`._", "`P_", "`v_", "`o_", "lH_", "LH_", ".H_", ">H_", "XH_", "ÕH_", "pH_", "PH_", "cH_", "®H_", "[H_", "{H_", "gH_", "GH_", "vH_", "VH_", "KH_", "~H_", ";H_", ":H_", "oH_", "OH_", "kH_", "|H_", "mH_", "MH_", "nH_", "NH_", "uH_", "UH_", "hH_", ",H_", "jH_", "YH_", "IH_", "iH_", "yH_", "<H_", "*H_", "f\\a", "wd", "we", "wE", "W!", "RD", "ta", "ft", "T!", "CO", "CI", "Cj", "JO", "`.", "`P", "`v", "`o", "`j", "`O", "`G", "%s", "%S", " ’", " ‘", "DD", "ff", "fÄ", "få", "fí", "fÉ", "fâ", "fï", "fÜ", "fõ", "fè", "fò", "f¾", "fÊ", "fl", "fL", "f.", "f>", "fX", "fÕ", "fp", "fP", "fc", "f®", "f[", "f{", "fg", "fG", "fv", "fV", "fK", "f~", "f;", "f:", "fo", "fO", "fk", "f|", "fm", "fM", "fn", "fN", "fu", "fU", "fh", "fr", "f,", "fj", "fY", "fI", "fi", "fy", "f<", "f*", "fË", "f†", "f…", "f‡", "Ñ%", "ê%", "ú%", "ì%", "á%", "ñ%", "ä%", "ô%", "Å%", "ç%", "Ö%", "ë%", "ù%", "î%", "à%", "ó%", "ã%", "ö%", "Ç%", "é%", "fø", "l_", "L_", "._", ">_", "X_", "Õ_", "p_", "P_", "c_", "®_", "[_", "{_", "g_", "G_", "v_", "V_", "K_", "~_", ";_", ":_", "o_", "O_", "k_", "|_", "m_", "M_", "n_", "N_", "u_", "U_", "h_", ",_", "j_", "Y_", "I_", "i_", "y_", "<_", "*_", "f\\", "rE", "re", "`ÿ", "`¥", "`ê", "`ú", "`È", "w", "b", "B", "W", "R", "Ì", "Ï", "t", "T", "´", "l", "L", ".", ">", "X", "Õ", "p", "P", "c", "®", "[", "{", "g", "G", "v", "V", "K", "~", ";", ":", "o", "O", "k", "|", "m", "M", "n", "N", "u", "U", "h", "r", ",", "j", "Y", "I", "i", "y", "<", "¿", "*", "Ë", "†", "…", "‡", "„", "Š", "H", "%", "e", "E", "q", "Q", "s", "S", "!", "d", "a", "x", "#", "D", "f", "\"", "$", "&", "'", "(", ")", "+", "-", "/", "=", "?", "@", "A", "C", "F", "J", "Z", "]", "^", "z", "}", "¡", "¢", "£", "¤", "¦", "§", "¨", "ª", "«", "¬", "­", "¯", "°", "±", "²", "³", "µ", "¶", "¸", "¹", "º", "½", "¾", "À", "Á", "Â", "Ä", "Å", "Æ", "Ç", "È", "É", "Ê", "Í", "Î", "Ð", "Ñ", "Ò", "Ó", "Ô", "Ö", "×", "Ø", "Ù", "Ú", "Ü", "Ý", "Þ", "ß", "à", "á", "â", "ã", "ä", "å", "æ", "ç", "è", "é", "ê", "ë", "ì", "í", "î", "ï", "ð", "ñ", "ò", "ó", "ô", "õ", "ö", "÷", "ø", "ù", "ú", "û", "ü", "ý", "þ", "ÿ", "›", "ƒ", "Œ", "ˉ", "‚", "“", "ˆ", "œ", "˜", "—", "™", "∙", "š", "•", "−", "‹", "‰"];
  
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const fmRegex = new RegExp(fmKeys.map(k => escapeRegex(k)).join('|'), 'g');
  const fmRulesRegex = new RegExp(Object.keys(fmRules).map(k => escapeRegex(k)).join('|'), 'g');

  function convertFMToUnicode(text) {
    if (!text) return '';
    // 1. Apply rules (kombuwa, rakaransaya reordering)
    let processed = text.replace(fmRulesRegex, matched => fmRules[matched] || matched);
    // 2. Replace characters from longest to shortest
    return processed.replace(fmRegex, matched => fmMappings[matched] !== undefined ? fmMappings[matched] : matched);
  }

  // Top-level aliases
  const singlishToSinhala = convertSinglishToSinhala;
  const unicodeToAbhaya = convertUnicodeToFM;
  const abhayaToUnicode = convertFMToUnicode;

  // ========================================================
  // 4. DYNAMIC 5-ROW ACCORDION GUIDE INJECTOR
  // ========================================================
  function toggleSinhalaGuide() {
    const body = document.getElementById('sinhala-guide-body');
    const icon = document.getElementById('sinhala-guide-icon');
    if (body) {
      const isHidden = body.classList.contains('hidden');
      body.classList.toggle('hidden');
      if (icon) {
        icon.classList.toggle('rotate-180', isHidden);
      }
    }
  }

  function renderSinhalaGuide(containerId = 'sinhala-guide-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="border border-slate-800 rounded-xl bg-slate-900/60 overflow-hidden shadow-lg transition-all mt-4">
        <button type="button" onclick="window.toggleSinhalaGuide()"
          class="w-full px-4 py-3 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-cyan-300 hover:text-cyan-200 bg-slate-900/90 hover:bg-slate-850 border-b border-slate-800 transition">
          <div class="flex items-center space-x-2">
            <span class="text-base">📖</span>
            <span class="font-heading font-bold text-white tracking-wide">ශබ්දානුකූල අකුරු සූචිය (Singlish Alphabet Reference)</span>
            <span class="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">5 Categories</span>
          </div>
          <div class="flex items-center space-x-2 text-slate-400">
            <span class="text-[11px] font-normal hidden sm:inline">ක්ලික් කර විවෘත කරන්න</span>
            <i id="sinhala-guide-icon" class="fa-solid fa-chevron-down text-xs transition-transform duration-200"></i>
          </div>
        </button>

        <div id="sinhala-guide-body" class="hidden p-3 sm:p-5 text-xs overflow-x-auto space-y-3">
          <div class="grid grid-cols-1 gap-2.5">
            <!-- Row 1: ස්වර (Vowels) -->
            <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                  <span class="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
                  පෙළ 1: ස්වර (Vowels)
                </span>
                <span class="text-[10px] text-slate-400 font-mono">a, aa, A, Aa, i, ii, u, uu, R, Ru, e, ee, ai, o, oo, au</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span class="guide-chip"><b class="text-cyan-400">a</b>: අ</span>
                <span class="guide-chip"><b class="text-cyan-400">aa</b>: ආ</span>
                <span class="guide-chip"><b class="text-cyan-400">A</b>: ඇ</span>
                <span class="guide-chip"><b class="text-cyan-400">Aa</b>: ඈ</span>
                <span class="guide-chip"><b class="text-cyan-400">i</b>: ඉ</span>
                <span class="guide-chip"><b class="text-cyan-400">ii</b>: ඊ</span>
                <span class="guide-chip"><b class="text-cyan-400">u</b>: උ</span>
                <span class="guide-chip"><b class="text-cyan-400">uu</b>: ඌ</span>
                <span class="guide-chip"><b class="text-cyan-400">R</b>: ඍ</span>
                <span class="guide-chip"><b class="text-cyan-400">Ru</b>: ඎ</span>
                <span class="guide-chip"><b class="text-cyan-400">e</b>: එ</span>
                <span class="guide-chip"><b class="text-cyan-400">ee</b>: ඒ</span>
                <span class="guide-chip"><b class="text-cyan-400">ai</b>: ඓ</span>
                <span class="guide-chip"><b class="text-cyan-400">o</b>: ඔ</span>
                <span class="guide-chip"><b class="text-cyan-400">oo</b>: ඕ</span>
                <span class="guide-chip"><b class="text-cyan-400">au</b>: ඖ</span>
              </div>
            </div>

            <!-- Row 2: මූලික ව්‍යංජන (Basic Consonants) -->
            <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                  පෙළ 2: මූලික ව්‍යංජන (Basic Consonants)
                </span>
                <span class="text-[10px] text-slate-400 font-mono">ka, ga, cha, ja, ta, da, tha, dha, na, pa, ba...</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span class="guide-chip"><b class="text-emerald-400">ka</b>: ක</span>
                <span class="guide-chip"><b class="text-emerald-400">ga</b>: ග</span>
                <span class="guide-chip"><b class="text-emerald-400">cha</b>: ච</span>
                <span class="guide-chip"><b class="text-emerald-400">ja</b>: ජ</span>
                <span class="guide-chip"><b class="text-emerald-400">ta</b>: ට</span>
                <span class="guide-chip"><b class="text-emerald-400">da</b>: ඩ</span>
                <span class="guide-chip"><b class="text-emerald-400">tha</b>: ත</span>
                <span class="guide-chip"><b class="text-emerald-400">dha</b>: ද</span>
                <span class="guide-chip"><b class="text-emerald-400">na</b>: න</span>
                <span class="guide-chip"><b class="text-emerald-400">Na</b>: ණ</span>
                <span class="guide-chip"><b class="text-emerald-400">pa</b>: ප</span>
                <span class="guide-chip"><b class="text-emerald-400">ba</b>: බ</span>
                <span class="guide-chip"><b class="text-emerald-400">ma</b>: ම</span>
                <span class="guide-chip"><b class="text-emerald-400">ya</b>: ය</span>
                <span class="guide-chip"><b class="text-emerald-400">ra</b>: ර</span>
                <span class="guide-chip"><b class="text-emerald-400">la</b>: ල</span>
                <span class="guide-chip"><b class="text-emerald-400">La</b>: ළ</span>
                <span class="guide-chip"><b class="text-emerald-400">wa/va</b>: ව</span>
                <span class="guide-chip"><b class="text-emerald-400">sa</b>: ස</span>
                <span class="guide-chip"><b class="text-emerald-400">sha</b>: ශ</span>
                <span class="guide-chip"><b class="text-emerald-400">Sha</b>: ෂ</span>
                <span class="guide-chip"><b class="text-emerald-400">ha</b>: හ</span>
                <span class="guide-chip"><b class="text-emerald-400">fa</b>: ෆ</span>
              </div>
            </div>

            <!-- Row 3: මහාප්‍රාණ අකුරු (Mahaprana) -->
            <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <span class="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                  පෙළ 3: මහාප්‍රාණ අකුරු (Mahaprana Consonants)
                </span>
                <span class="text-[10px] text-slate-400 font-mono">kha, gha, chha, Ja, Ta, Da, thha, dhha, pha, bha</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span class="guide-chip"><b class="text-amber-400">kha</b>: ඛ</span>
                <span class="guide-chip"><b class="text-amber-400">gha</b>: ඝ</span>
                <span class="guide-chip"><b class="text-amber-400">chha</b>: ඡ</span>
                <span class="guide-chip"><b class="text-amber-400">Ja</b>: ඣ</span>
                <span class="guide-chip"><b class="text-amber-400">Ta</b>: ඨ</span>
                <span class="guide-chip"><b class="text-amber-400">Da</b>: ඪ</span>
                <span class="guide-chip"><b class="text-amber-400">thha</b>: ථ</span>
                <span class="guide-chip"><b class="text-amber-400">dhha</b>: ධ</span>
                <span class="guide-chip"><b class="text-amber-400">pha</b>: ඵ</span>
                <span class="guide-chip"><b class="text-amber-400">bha</b>: භ</span>
              </div>
            </div>

            <!-- Row 4: සඤ්ඤක හා විශේෂ අක්ෂර (Sanyaka & Special) -->
            <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
                  <span class="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
                  පෙළ 4: සඤ්ඤක හා විශේෂ අක්ෂර (Sanyaka & Special)
                </span>
                <span class="text-[10px] text-slate-400 font-mono">zga, zja, zda, zdha, zka, zha, Ba, Lu</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span class="guide-chip"><b class="text-purple-400">zga</b>: ඟ</span>
                <span class="guide-chip"><b class="text-purple-400">zja</b>: ඦ</span>
                <span class="guide-chip"><b class="text-purple-400">zda</b>: ඬ</span>
                <span class="guide-chip"><b class="text-purple-400">zdha</b>: ඳ</span>
                <span class="guide-chip"><b class="text-purple-400">zka</b>: ඤ</span>
                <span class="guide-chip"><b class="text-purple-400">zha</b>: ඥ</span>
                <span class="guide-chip"><b class="text-purple-400">Ba</b>: ඹ</span>
                <span class="guide-chip"><b class="text-purple-400">Lu</b>: ළු</span>
              </div>
            </div>

            <!-- Row 5: පිල්ලම්, යංසය, රකාරාංශය හා වෙනස්කාරක (Modifiers & Conjuncts) -->
            <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-rose-300 flex items-center gap-1.5 text-xs">
                  <span class="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
                  පෙළ 5: පිල්ලම්, යංසය, රකාරාංශය හා වෙනස්කාරක (Modifiers & Conjuncts)
                </span>
                <span class="text-[10px] text-slate-400 font-mono">kaH, kax, kaX, kya, kra, k, kaa, ki, kee...</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span class="guide-chip"><b class="text-rose-400">k</b>: ක්</span>
                <span class="guide-chip"><b class="text-rose-400">ka</b>: ක</span>
                <span class="guide-chip"><b class="text-rose-400">kaa</b>: කා</span>
                <span class="guide-chip"><b class="text-rose-400">kA</b>: කැ</span>
                <span class="guide-chip"><b class="text-rose-400">kAa</b>: කෑ</span>
                <span class="guide-chip"><b class="text-rose-400">ki</b>: කි</span>
                <span class="guide-chip"><b class="text-rose-400">kii</b>: කී</span>
                <span class="guide-chip"><b class="text-rose-400">ku</b>: කු</span>
                <span class="guide-chip"><b class="text-rose-400">kuu</b>: කූ</span>
                <span class="guide-chip"><b class="text-rose-400">kR/kru</b>: කෘ</span>
                <span class="guide-chip"><b class="text-rose-400">kRu/kruu</b>: කෲ</span>
                <span class="guide-chip"><b class="text-rose-400">ke</b>: කෙ</span>
                <span class="guide-chip"><b class="text-rose-400">kee</b>: කේ</span>
                <span class="guide-chip"><b class="text-rose-400">kai</b>: කෛ</span>
                <span class="guide-chip"><b class="text-rose-400">ko</b>: කො</span>
                <span class="guide-chip"><b class="text-rose-400">koo</b>: කෝ</span>
                <span class="guide-chip"><b class="text-rose-400">kau</b>: කෞ</span>
                <span class="guide-chip"><b class="text-rose-400">kya</b>: ක්‍ය (යංසය)</span>
                <span class="guide-chip"><b class="text-rose-400">kra</b>: ක්‍ර (රකාරාංශය)</span>
                <span class="guide-chip"><b class="text-rose-400">kax / kaX</b>: කං (අනුස්වාරය)</span>
                <span class="guide-chip"><b class="text-rose-400">kaH</b>: කඃ (විසර්ගය)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Auto-initialize guide if DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => renderSinhalaGuide());
    } else {
      setTimeout(() => renderSinhalaGuide(), 50);
    }
  }

  // Export to window
  window.singlishToSinhala = singlishToSinhala;
  window.convertSinglishToSinhala = singlishToSinhala;
  window.unicodeToAbhaya = unicodeToAbhaya;
  window.convertUnicodeToFM = unicodeToAbhaya;
  window.abhayaToUnicode = abhayaToUnicode;
  window.convertFMToUnicode = abhayaToUnicode;
  window.renderSinhalaGuide = renderSinhalaGuide;
  window.toggleSinhalaGuide = toggleSinhalaGuide;

  window.SinhalaEngine = {
    singlishToSinhala,
    convertSinglishToSinhala,
    unicodeToAbhaya,
    convertUnicodeToFM,
    abhayaToUnicode,
    convertFMToUnicode,
    renderSinhalaGuide,
    toggleSinhalaGuide
  };

})(window);
