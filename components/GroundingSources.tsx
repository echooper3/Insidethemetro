import React, { useState } from 'react';
import { MapPin, ExternalLink, Star } from 'lucide-react';
import { GroundingChunk } from '../types';

interface GroundingSourcesProps {
  chunks: GroundingChunk[];
}

const GroundingSources: React.FC<GroundingSourcesProps> = ({ chunks }) => {
  if (!chunks || chunks.length === 0) return null;

  // Filter out chunks that don't have useful URIs
  const validChunks = chunks.filter(c => (c.web?.uri || c.maps?.uri));

  if (validChunks.length === 0) return null;

  return (
    <div className="mt-6 border-t border-slate-200 pt-4">
      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Sources & Locations
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {validChunks.map((chunk, index) => {
          if (chunk.maps) {
            return (
              <a 
                key={index} 
                href={chunk.maps.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:border-orange-300 group"
              >
                <div className="mt-1 mr-3 text-orange-500 group-hover:text-orange-600">
                  <MapPin size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-slate-800 truncate text-sm">
                    {chunk.maps.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    Open in Google Maps <ExternalLink size={10} className="ml-1" />
                  </p>
                  {chunk.maps.placeAnswerSources?.reviewSnippets?.[0] && (
                     <div className="mt-2 text-xs text-slate-600 italic bg-slate-50 p-2 rounded">
                        "{chunk.maps.placeAnswerSources.reviewSnippets[0].content.slice(0, 60)}..."
                     </div>
                  )}
                </div>
              </a>
            );
          } else if (chunk.web) {
             return (
              <a 
                key={index} 
                href={chunk.web.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:border-orange-300 group"
              >
                <div className="mr-3 text-orange-500 group-hover:text-orange-600">
                  <ExternalLink size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-slate-800 truncate text-sm">
                    {chunk.web.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Source
                  </p>
                </div>
              </a>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default GroundingSources;