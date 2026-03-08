export function parseXML(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  const sequenceItem = xmlDoc.querySelector('sequence');
  if (!sequenceItem) {
    throw new Error('Invalid XML: No sequence element found');
  }

  const name = sequenceItem.querySelector('name')?.textContent?.split(' (')[0] || 'Unknown';
  const framerate = parseInt(sequenceItem.querySelector('timecode rate timebase')?.textContent || '24');
  const cutIn = parseInt(sequenceItem.querySelector('timecode frame')?.textContent || '0');
  const duration = parseInt(sequenceItem.querySelector('duration')?.textContent || '0');
  const tcInString = sequenceItem.querySelector('timecode string')?.textContent || '00:00:00:00';

  const tcIn = parseTimecode(tcInString, framerate);
  const tcOut = addFramesToTimecode(tcIn, duration, framerate);
  const cutOut = cutIn + duration;

  const sequenceInfo = {
    name,
    framerate,
    cutDuration: duration,
    tcIn: tcInString,
    tcOut: formatTimecode(tcOut, framerate),
    cutIn,
    cutOut
  };

  const videoTrack = xmlDoc.querySelector('sequence media video');
  if (!videoTrack) {
    throw new Error('Invalid XML: No video track found');
  }

  const clipItems = Array.from(videoTrack.querySelectorAll('clipitem'));
  const shots = [];
  const clipCache = new Map();

  clipItems.forEach((clipItem, index) => {
    const clipId = clipItem.getAttribute('id');
    const clipOccurrence = clipId?.split(' ').pop() || '0';

    const name = clipItem.querySelector('name')?.textContent || `Clip_${index + 1}`;
    const duration = parseInt(clipItem.querySelector('duration')?.textContent || '0');
    const start = parseInt(clipItem.querySelector('start')?.textContent || '0');
    const end = parseInt(clipItem.querySelector('end')?.textContent || '0');
    const inPoint = parseInt(clipItem.querySelector('in')?.textContent || '0');
    const outPoint = parseInt(clipItem.querySelector('out')?.textContent || '0');

    let pathurl = '';
    let clipTcIn = '00:00:00:00';

    if (clipOccurrence === '0') {
      const fileElement = clipItem.querySelector('file');
      if (fileElement) {
        const pathurlElement = fileElement.querySelector('pathurl');
        if (pathurlElement) {
          pathurl = decodeURIComponent(pathurlElement.textContent.split('//')[1] || '');
        }
        const timecodeString = fileElement.querySelector('timecode string');
        if (timecodeString) {
          clipTcIn = timecodeString.textContent;
        }
      }
      clipCache.set(name, { pathurl, clipTcIn });
    } else {
      const cached = clipCache.get(name);
      if (cached) {
        pathurl = cached.pathurl;
        clipTcIn = cached.clipTcIn;
      }
    }

    const clipInTc = parseTimecode(clipTcIn, framerate);
    const sourceTcIn = addFramesToTimecode(clipInTc, inPoint, framerate);
    const sourceTcOut = addFramesToTimecode(clipInTc, outPoint, framerate);

    const recordTcIn = addFramesToTimecode(tcIn, start, framerate);
    const recordTcOut = addFramesToTimecode(tcIn, end, framerate);

    const cutOrder = String((index + 1) * 10).padStart(3, '0');
    const shotCode = `PL_${cutOrder}_${sequenceInfo.name}`;

    shots.push({
      shotCode,
      clipName: name,
      cutOrder,
      sourceTcIn: formatTimecode(sourceTcIn, framerate),
      sourceTcOut: formatTimecode(sourceTcOut, framerate),
      recordTcIn: formatTimecode(recordTcIn, framerate),
      recordTcOut: formatTimecode(recordTcOut, framerate),
      cutIn: sourceTcIn.totalFrames,
      cutOut: sourceTcOut.totalFrames,
      cutDuration: outPoint - inPoint,
      pathurl
    });
  });

  return { sequenceInfo, shots };
}

function parseTimecode(tcString, framerate) {
  const parts = tcString.split(':').map(p => parseInt(p));
  if (parts.length !== 4) {
    return { hours: 0, minutes: 0, seconds: 0, frames: 0, totalFrames: 0 };
  }

  const [hours, minutes, seconds, frames] = parts;
  const totalFrames = (hours * 3600 + minutes * 60 + seconds) * framerate + frames;

  return { hours, minutes, seconds, frames, totalFrames };
}

function addFramesToTimecode(tc, framesToAdd, framerate) {
  const totalFrames = tc.totalFrames + framesToAdd;

  const frames = totalFrames % framerate;
  const totalSeconds = Math.floor(totalFrames / framerate);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  return { hours, minutes, seconds, frames, totalFrames };
}

function formatTimecode(tc, framerate) {
  const pad = (num, size = 2) => String(num).padStart(size, '0');
  return `${pad(tc.hours)}:${pad(tc.minutes)}:${pad(tc.seconds)}:${pad(tc.frames)}`;
}
