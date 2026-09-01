'use client';
/* oxlint-disable next(no-img-element), jsx-a11y(prefer-tag-over-role) -- Raw images and radio-button cards are intentional for email-safe output and the themed picker. */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';
import { Call02Icon, CopyIcon, Download01Icon, GlobalIcon, Mail01Icon, RotateCcwIcon, Tick02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type SignatureData = { name: string; role: string; company: string; email: string; phone: string; website: string };
type Variant = 'classic' | 'navy' | 'lockup' | 'lockup-navy' | 'stacked' | 'stacked-navy' | 'lockup-stacked' | 'lockup-stacked-navy';
type LabelStyle = 'icon' | 'text' | 'both';
type Layout = 'left' | 'stacked';
type LogoType = 'mark' | 'lockup';

const rowIcons = { email: Mail01Icon, phone: Call02Icon, website: GlobalIcon } as const satisfies Record<string, IconSvgElement>;

const defaults: SignatureData = {
  name: 'Max Modlin', role: 'Founder', company: 'Agency AI', email: 'max@agencyaiuk.com',
  phone: '+44 7846 286 762', website: 'www.agencyaiuk.com',
};
const navy = '#0F2540';
const mint = '#C7E2D0';

const variantMeta: Record<Variant, { label: string; description: string; isDark: boolean; layout: Layout; logoType: LogoType }> = {
  classic: { label: 'Classic', description: 'Clean & minimal', isDark: false, layout: 'left', logoType: 'mark' },
  navy: { label: 'Navy', description: 'Rich & distinctive', isDark: true, layout: 'left', logoType: 'mark' },
  lockup: { label: 'Lockup', description: 'Full wordmark', isDark: false, layout: 'left', logoType: 'lockup' },
  'lockup-navy': { label: 'Lockup Navy', description: 'Full wordmark, deep ground', isDark: true, layout: 'left', logoType: 'lockup' },
  stacked: { label: 'Stacked', description: 'Mark above', isDark: false, layout: 'stacked', logoType: 'mark' },
  'stacked-navy': { label: 'Stacked Navy', description: 'Mark above, deep ground', isDark: true, layout: 'stacked', logoType: 'mark' },
  'lockup-stacked': { label: 'Lockup Stacked', description: 'Full wordmark above', isDark: false, layout: 'stacked', logoType: 'lockup' },
  'lockup-stacked-navy': { label: 'Lockup Stacked Navy', description: 'Full wordmark above, deep ground', isDark: true, layout: 'stacked', logoType: 'lockup' },
};
const variantOrder = Object.keys(variantMeta) as Variant[];

const LOGO_FILES = {
  markLight: '/logos/chevron-navy.svg',
  markDark: '/logos/chevron-white.svg',
  lockupLight: '/logos/agencyai-vector-logo-pack/lockup-light.svg',
  lockupDark: '/logos/agencyai-vector-logo-pack/lockup-dark.svg',
} as const;
type LogoKey = keyof typeof LOGO_FILES;

function logoKeyFor(variant: Variant): LogoKey {
  const meta = variantMeta[variant];
  if (meta.logoType === 'lockup') return meta.isDark ? 'lockupDark' : 'lockupLight';
  return meta.isDark ? 'markDark' : 'markLight';
}

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
function normaliseWebsite(value: string) { return /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`; }
function normalisePhone(value: string) { return value.replace(/[^+\d]/g, ''); }
function websiteHref(value: string) { return value.trim() ? normaliseWebsite(value) : '#'; }
function emailHref(value: string) { return value.trim() ? `mailto:${value.trim()}` : '#'; }
function phoneHref(value: string) { return value.trim() ? `tel:${normalisePhone(value)}` : '#'; }

function toKebabCase(key: string) {
  return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function iconDataUri(icon: IconSvgElement, color: string, size: number) {
  const markup = icon.map(([tag, attrs]) => {
    const attrString = Object.entries(attrs).filter(([key]) => key !== 'key').map(([key, value]) => `${toKebabCase(key)}="${key === 'strokeWidth' ? 2 : value}"`).join(' ');
    return `<${tag} ${attrString}/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" color="${color}">${markup}</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function Icon(props: ComponentProps<typeof HugeiconsIcon>) {
  return <HugeiconsIcon strokeWidth={2} {...props} />;
}

function makeSignatureHtml(data: SignatureData, variant: Variant, logoSrc: string, labelStyle: LabelStyle) {
  const d = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, escapeHtml(value)])) as SignatureData;
  const meta = variantMeta[variant];
  const isDark = meta.isDark;
  const bodyColour = isDark ? '#FFFFFF' : navy;
  const secondaryColour = isDark ? mint : '#43705A';
  const panel = isDark ? navy : '#FFFFFF';
  const ruleColour = isDark ? mint : 'rgba(15,37,64,.14)';
  const tileBackground = isDark ? navy : mint;
  const emailLink = escapeHtml(emailHref(data.email));
  const phoneLink = escapeHtml(phoneHref(data.phone));
  const webLink = escapeHtml(websiteHref(data.website));
  function labelCell(key: keyof typeof rowIcons, text: string) {
    const icon = `<img src="${iconDataUri(rowIcons[key], secondaryColour, 12)}" width="12" height="12" alt="${labelStyle === 'icon' ? text : ''}" style="display:inline-block;vertical-align:middle;${labelStyle === 'both' ? 'margin-right:5px;' : ''}" />`;
    if (labelStyle === 'icon') return icon;
    if (labelStyle === 'text') return text;
    return `${icon}${text}`;
  }
  const contactTable = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:13px;line-height:17px;color:${bodyColour};"><tr><td style="padding:0 12px 1px 0;color:${secondaryColour};font-family:'IBM Plex Mono',Consolas,monospace;font-size:11px;letter-spacing:.08em;">${labelCell('email', 'EMAIL')}</td><td style="padding:0 0 1px;"><a href="${emailLink}" style="color:${bodyColour};text-decoration:none;">${d.email}</a></td></tr><tr><td style="padding:0 12px 1px 0;color:${secondaryColour};font-family:'IBM Plex Mono',Consolas,monospace;font-size:11px;letter-spacing:.08em;">${labelCell('phone', 'PHONE')}</td><td style="padding:0 0 1px;"><a href="${phoneLink}" style="color:${bodyColour};text-decoration:none;">${d.phone}</a></td></tr><tr><td style="padding:0 12px;color:${secondaryColour};font-family:'IBM Plex Mono',Consolas,monospace;font-size:11px;letter-spacing:.08em;">${labelCell('website', 'WEB')}</td><td><a href="${webLink}" style="color:${bodyColour};text-decoration:none;">${d.website}</a></td></tr></table>`;
  const detailsBlock = `<div style="font-size:26px;line-height:31px;font-weight:700;letter-spacing:-0.7px;color:${bodyColour};">${d.name}</div><div style="margin-top:3px;font-family:'IBM Plex Mono','SFMono-Regular',Consolas,monospace;font-size:11px;line-height:17px;letter-spacing:.09em;text-transform:uppercase;color:${secondaryColour};">${d.role}${d.role && d.company ? ' / ' : ''}${d.company}</div><div style="height:10px;line-height:10px;">&nbsp;</div>${contactTable}`;

  if (meta.layout === 'stacked') {
    const topCell = meta.logoType === 'lockup'
      ? (() => {
        const lockupHeight = 34;
        const lockupWidth = Math.round((357.12 / 73.92) * lockupHeight);
        return `<img src="${logoSrc}" width="${lockupWidth}" height="${lockupHeight}" alt="Agency AI" style="display:block;width:${lockupWidth}px;height:${lockupHeight}px;border:0;" />`;
      })()
      : (() => {
        const tileSize = isDark ? 72 : 64;
        const tileImgWidth = isDark ? 46 : 40;
        const tileRadius = isDark ? 0 : Math.round(tileSize / 2);
        return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td width="${tileSize}" height="${tileSize}" style="width:${tileSize}px;height:${tileSize}px;background:${tileBackground};border-radius:${tileRadius}px;text-align:center;vertical-align:middle;"><img src="${logoSrc}" width="${tileImgWidth}" alt="Agency AI" style="display:block;width:${tileImgWidth}px;height:auto;margin:0 auto;border:0;transform:translateY(3px);" /></td></tr></table>`;
      })();
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background:${panel};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${bodyColour};"><tr><td style="padding:${isDark ? '28px 28px 0' : '8px 0 0'};">${topCell}</td></tr><tr><td style="padding:${isDark ? '16px 28px 28px' : '16px 0 8px'};border-top:1px solid ${ruleColour};min-width:285px;">${detailsBlock}</td></tr></table>`;
  }

  if (meta.logoType === 'lockup') {
    const lockupHeight = 30;
    const lockupWidth = Math.round((357.12 / 73.92) * lockupHeight);
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background:${panel};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${bodyColour};"><tr><td style="padding:${isDark ? '28px 26px 28px 28px' : '8px 26px 8px 0'};vertical-align:middle;"><img src="${logoSrc}" width="${lockupWidth}" height="${lockupHeight}" alt="Agency AI" style="display:block;width:${lockupWidth}px;height:${lockupHeight}px;border:0;" /></td><td width="1" style="width:1px;background:${ruleColour};font-size:0;line-height:0;">&nbsp;</td><td style="padding:${isDark ? '28px 32px 28px 30px' : '8px 34px 8px 30px'};vertical-align:middle;min-width:285px;">${detailsBlock}</td></tr></table>`;
  }

  const tileSize = isDark ? 92 : 64;
  const tileImgWidth = isDark ? 58 : 40;
  const tileRadius = isDark ? 0 : Math.round(tileSize / 2);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background:${panel};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${bodyColour};"><tr><td style="padding:${isDark ? '28px 0 28px 28px' : '8px 0'};vertical-align:middle;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td width="${tileSize}" height="${tileSize}" style="width:${tileSize}px;height:${tileSize}px;background:${tileBackground};border-radius:${tileRadius}px;text-align:center;vertical-align:middle;"><img src="${logoSrc}" width="${tileImgWidth}" alt="Agency AI" style="display:block;width:${tileImgWidth}px;height:auto;margin:0 auto;border:0;transform:translateY(3px);" /></td></tr></table></td><td width="1" style="width:1px;background:${ruleColour};font-size:0;line-height:0;">&nbsp;</td><td style="padding:${isDark ? '28px 32px 28px 30px' : '8px 34px 8px 28px'};vertical-align:middle;min-width:285px;">${detailsBlock}</td></tr></table>`;
}

function SignaturePreview({ data, variant, labelStyle, logoSrc }: { data: SignatureData; variant: Variant; labelStyle: LabelStyle; logoSrc: string }) {
  const meta = variantMeta[variant];
  const showIcon = labelStyle !== 'text';
  const showText = labelStyle !== 'icon';
  function label(key: keyof typeof rowIcons, text: string) {
    return <>{showIcon && <Icon icon={rowIcons[key]} aria-hidden="true" />}{showText ? text : <span className="sr-only">{text}</span>}</>;
  }
  const classNames = ['signature-card', `signature-card--${variant}`];
  if (meta.isDark) classNames.push('signature-card--dark');
  if (meta.layout === 'stacked') classNames.push('signature-card--stacked-layout');
  return <div className={classNames.join(' ')}>
    <div className={meta.logoType === 'lockup' ? 'signature-lockup' : 'signature-mark'}><img src={logoSrc} alt="Agency AI" /></div>
    <div className="signature-rule" />
    <div className="signature-details">
      <h2>{data.name || 'Your name'}</h2>
      <p className="signature-role">{[data.role, data.company].filter(Boolean).join(' · ') || 'Your role'}</p>
      <dl className={`signature-dl signature-dl--${labelStyle}`}>
        <div><dt>{label('email', 'EMAIL')}</dt><dd><a href={emailHref(data.email)}>{data.email || 'you@company.com'}</a></dd></div>
        <div><dt>{label('phone', 'PHONE')}</dt><dd><a href={phoneHref(data.phone)}>{data.phone || '+44 0000 000 000'}</a></dd></div>
        <div><dt>{label('website', 'WEB')}</dt><dd><a href={websiteHref(data.website)} target="_blank" rel="noreferrer">{data.website || 'www.company.com'}</a></dd></div>
      </dl>
    </div>
  </div>;
}

export default function Home() {
  const [data, setData] = useState<SignatureData>(defaults);
  const [variant, setVariant] = useState<Variant>('classic');
  const [labelStyle, setLabelStyle] = useState<LabelStyle>('both');
  const [copied, setCopied] = useState(false);
  const [logoData, setLogoData] = useState<Record<LogoKey, string> | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void Promise.all((Object.keys(LOGO_FILES) as LogoKey[]).map(async (key) => {
      const svg = await fetch(LOGO_FILES[key]).then((response) => response.text());
      return [key, `data:image/svg+xml;base64,${btoa(svg)}`] as const;
    })).then((entries) => setLogoData(Object.fromEntries(entries) as Record<LogoKey, string>)).catch(() => setLogoData(null));
    return () => { if (copiedTimer.current) clearTimeout(copiedTimer.current); };
  }, []);

  const logoSrc = logoData?.[logoKeyFor(variant)] ?? LOGO_FILES[logoKeyFor(variant)];
  const html = useMemo(() => makeSignatureHtml(data, variant, logoSrc, labelStyle), [data, variant, logoSrc, labelStyle]);
  function update(key: keyof SignatureData, value: string) { setData((current) => ({ ...current, [key]: value })); }

  async function copySignature() {
    const plainText = [data.name, [data.role, data.company].filter(Boolean).join(' · '), data.email, data.phone, data.website].join('\n');
    try {
      if (typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([plainText], { type: 'text/plain' }) })]);
      } else { await navigator.clipboard.writeText(html); }
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch { await navigator.clipboard.writeText(html); setCopied(true); }
  }

  function downloadSignature() {
    const documentHtml = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(data.name)} — Email signature</title></head><body style="margin:32px;background:#fff;">${html}</body></html>`;
    const url = URL.createObjectURL(new Blob([documentHtml], { type: 'text/html' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'agency-ai'}-signature.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <main className="app-shell">
    <section className="studio" aria-label="Email signature generator">
      <aside className="editor-panel">
        <div className="panel-heading"><div><p className="step-label">01 / DETAILS</p><h2>Your information</h2></div><button className="reset-button" type="button" onClick={() => setData(defaults)}><Icon icon={RotateCcwIcon} aria-hidden="true" /> Reset</button></div>
        <div className="form-grid">{(Object.keys(defaults) as (keyof SignatureData)[]).map((key) => <label key={key} className={key === 'name' || key === 'email' || key === 'website' ? 'wide' : ''}><span>{key[0].toUpperCase() + key.slice(1)}</span><Input value={data[key]} onChange={(event) => update(key, event.target.value)} autoComplete={key === 'name' ? 'name' : key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'off'} /></label>)}</div>
        <div className="variant-section"><p className="step-label">02 / FINISH</p><div className="variant-picker" role="radiogroup" aria-label="Signature finish">
          {variantOrder.map((key) => {
            const meta = variantMeta[key];
            return <button key={key} type="button" role="radio" aria-checked={variant === key} className={variant === key ? 'is-active' : ''} onClick={() => setVariant(key)}>
              <span className={`swatch ${meta.isDark ? 'swatch--navy' : 'swatch--classic'}`}><img src={meta.isDark ? '/logos/chevron-white.svg' : '/logos/chevron-navy.svg'} alt="" /></span>
              <span><strong>{meta.label}</strong><small>{meta.description}</small></span>
              {variant === key && <Icon icon={Tick02Icon} aria-hidden="true" />}
            </button>;
          })}
        </div></div>
        <div className="label-style-section"><p className="step-label">03 / LABELS</p><div className="label-style-picker" role="radiogroup" aria-label="Row label style">
          <button type="button" role="radio" aria-checked={labelStyle === 'icon'} className={labelStyle === 'icon' ? 'is-active' : ''} onClick={() => setLabelStyle('icon')}>Icon</button>
          <button type="button" role="radio" aria-checked={labelStyle === 'text'} className={labelStyle === 'text' ? 'is-active' : ''} onClick={() => setLabelStyle('text')}>Text</button>
          <button type="button" role="radio" aria-checked={labelStyle === 'both'} className={labelStyle === 'both' ? 'is-active' : ''} onClick={() => setLabelStyle('both')}>Icon + Text</button>
        </div></div>
      </aside>
      <div className="preview-panel">
        <div className="preview-topline"><div><p className="step-label">PREVIEW</p><span>Updates as you type</span></div></div>
        <div className="preview-canvas"><SignaturePreview data={data} variant={variant} labelStyle={labelStyle} logoSrc={logoSrc} /></div>
        <div className="action-row"><Button className="copy-button" size="lg" onClick={copySignature}>{copied ? <Icon icon={Tick02Icon} aria-hidden="true" /> : <Icon icon={CopyIcon} aria-hidden="true" />}{copied ? 'Copied to clipboard' : 'Copy signature'}</Button><Button className="download-button" size="lg" variant="outline" onClick={downloadSignature}><Icon icon={Download01Icon} aria-hidden="true" /> Download HTML</Button></div>
        <p className="paste-hint"><Icon icon={Mail01Icon} aria-hidden="true" /> Paste into Gmail, Outlook or Apple Mail’s signature editor.</p>
      </div>
    </section>
  </main>;
}
