import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classifyCreatorTier, getCreatorScore } from './creator-tier.js';

// ============================================================
// Creator Tier Classification — S/S-/A/B/C
// Based on design doc: docs/scoring-framework-design.md
// ============================================================

describe('classifyCreatorTier', () => {
  // S-tier: AI company founders, major OSS creators who created paradigm-shifting OSS
  it('S-tier: Anthropic (AI platform creator)', () => {
    assert.equal(classifyCreatorTier({
      name: 'Anthropic',
      company: 'Anthropic',
      isFounder: true,
      majorOssProjects: [],
    }), 'S');
  });

  it('S-tier: Anthony Fu (Vue/Vite/Nuxt core team)', () => {
    assert.equal(classifyCreatorTier({
      name: 'Anthony Fu',
      company: null,
      isFounder: false,
      majorOssProjects: ['Vue', 'Vite', 'Nuxt'],
    }), 'S');
  });

  it('S-tier: Jesse Vincent (Request Tracker + multiple major OSS)', () => {
    assert.equal(classifyCreatorTier({
      name: 'Jesse Vincent',
      company: 'Prime Radiant',
      isFounder: true,
      majorOssProjects: ['Request Tracker', 'Perl'],
    }), 'S');
  });

  // S- tier: Industry leaders without personal major OSS, or official tool orgs
  it('S- tier: Garry Tan (YC CEO, no personal major OSS)', () => {
    assert.equal(classifyCreatorTier({
      name: 'Garry Tan',
      role: 'CEO',
      company: 'Y Combinator',
      isFounder: true,
      majorOssProjects: [],
    }), 'S-');
  });

  it('S-tier: HashiCorp (created Terraform/Vault = top-tier OSS)', () => {
    // HashiCorp created Terraform/Vault which are in TOP_TIER_OSS → S
    assert.equal(classifyCreatorTier({
      name: 'HashiCorp',
      company: 'HashiCorp',
      isFounder: false,
      isOfficialOrg: true,
      majorOssProjects: ['Terraform', 'Vault'],
    }), 'S');
  });

  it('S- tier: official org without top-tier OSS', () => {
    assert.equal(classifyCreatorTier({
      name: 'SomeToolCo',
      company: 'SomeToolCo',
      isFounder: false,
      isOfficialOrg: true,
      majorOssProjects: [],
      isIndustryLeader: true,
    }), 'S-');
  });

  // A-tier: Top company engineers, OSS maintainers, hackathon winners
  it('A-tier: Avi Fenesh (Valkey GLIDE maintainer)', () => {
    assert.equal(classifyCreatorTier({
      name: 'Avi Fenesh',
      role: 'maintainer',
      company: 'Valkey',
      isFounder: false,
      majorOssProjects: ['Valkey GLIDE'],
    }), 'A');
  });

  it('A-tier: official org without industry leadership', () => {
    assert.equal(classifyCreatorTier({
      name: 'Every Inc',
      company: 'Every Inc',
      isFounder: false,
      isOfficialOrg: true,
      majorOssProjects: [],
    }), 'A');
  });

  it('A-tier: top company engineer', () => {
    assert.equal(classifyCreatorTier({
      name: 'Someone',
      company: 'Google',
      isFounder: false,
      majorOssProjects: [],
    }), 'A');
  });

  // B-tier: Active contributors with proven track record
  it('B-tier: Affaan Mustafa (hackathon winner, 2+ high-star repos)', () => {
    assert.equal(classifyCreatorTier({
      name: 'Affaan Mustafa',
      role: 'contributor',
      company: null,
      isFounder: false,
      majorOssProjects: [],
      highStarRepos: 2,
    }), 'B');
  });

  // C-tier: New/unverified
  it('C-tier: unknown creator', () => {
    assert.equal(classifyCreatorTier({
      name: 'Unknown',
      role: null,
      company: null,
      isFounder: false,
      majorOssProjects: [],
    }), 'C');
  });
});

describe('getCreatorScore', () => {
  it('S = 10', () => assert.equal(getCreatorScore('S'), 10));
  it('S- = 8.5', () => assert.equal(getCreatorScore('S-'), 8.5));
  it('A = 7', () => assert.equal(getCreatorScore('A'), 7));
  it('B = 5', () => assert.equal(getCreatorScore('B'), 5));
  it('C = 2', () => assert.equal(getCreatorScore('C'), 2));
  it('unknown tier defaults to 0', () => assert.equal(getCreatorScore('X'), 0));
});
