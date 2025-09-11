import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PlayerComparison from "@/components/dashboard/PlayerComparison";
import { Activity } from "lucide-react";

export type Player = {
  id: number; name: string; team: string; position: string; kicks: number; handballs: number; marks: number; tackles: number; goals: number; efficiency: number;
};

export type PlayerPerformanceTabProps = {
  players: Player[];
  selectedPlayer: Player;
  setSelectedPlayer: (p: Player) => void;
  comparisonPlayer: Player;
  setComparisonPlayer: (p: Player) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedTeam: string;
  setSelectedTeam: (t: string) => void;
};

export default function PlayerPerformanceTab(props: PlayerPerformanceTabProps) {
  const { players, selectedPlayer, setSelectedPlayer, comparisonPlayer, setComparisonPlayer, searchTerm, setSearchTerm, selectedTeam, setSelectedTeam } = props;

  const filteredPlayers = useMemo(() => players.filter(
    (player) => player.name.toLowerCase().includes(searchTerm.toLowerCase()) && (selectedTeam === "all" || player.team === selectedTeam)
  ), [players, searchTerm, selectedTeam]);

  const playerComparisonData = useMemo(() => ([
    { stat: "Kicks", [selectedPlayer.name]: selectedPlayer.kicks, [comparisonPlayer.name]: comparisonPlayer.kicks },
    { stat: "Handballs", [selectedPlayer.name]: selectedPlayer.handballs, [comparisonPlayer.name]: comparisonPlayer.handballs },
    { stat: "Marks", [selectedPlayer.name]: selectedPlayer.marks, [comparisonPlayer.name]: comparisonPlayer.marks },
    { stat: "Tackles", [selectedPlayer.name]: selectedPlayer.tackles, [comparisonPlayer.name]: comparisonPlayer.tackles },
    { stat: "Goals", [selectedPlayer.name]: selectedPlayer.goals, [comparisonPlayer.name]: comparisonPlayer.goals },
    { stat: "Efficiency", [selectedPlayer.name]: selectedPlayer.efficiency, [comparisonPlayer.name]: comparisonPlayer.efficiency },
  ]), [selectedPlayer, comparisonPlayer]);

  // Showcase trading cards (static dataset localized here)
  const [showAllCards, setShowAllCards] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  const playerCards = [
    { id: 1, name: "CHARLIE CURNOW", team: "Carlton", number: 30, background: "from-blue-600 via-blue-700 to-blue-800", image: "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg", stats: { goalAccuracy: 92, handballs: 14, disposals: 32, kicks: 18, marks: 9, tackles: 6 } },
    { id: 2, name: "PATRICK CRIPPS", team: "Carlton", number: 22, background: "from-blue-700 via-blue-800 to-blue-900", image: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg", stats: { goalAccuracy: 78, handballs: 20, disposals: 40, kicks: 16, marks: 8, tackles: 10 } },
    { id: 3, name: "JEREMY CAMERON", team: "Geelong", number: 9, background: "from-blue-800 to-blue-900", image: "https://images.pexels.com/photos/209961/pexels-photo-209961.jpeg", stats: { goalAccuracy: 100, handballs: 12, disposals: 38, kicks: 26, marks: 7, tackles: 9 } },
    { id: 4, name: "DUSTIN MARTIN", team: "Richmond", number: 3, background: "from-yellow-500 to-yellow-600", image: "https://images.pexels.com/photos/159684/soccer-football-soccer-player-sport-159684.jpeg", stats: { goalAccuracy: 80, handballs: 8, disposals: 28, kicks: 20, marks: 6, tackles: 4 } },
  ];

  const handleCardClick = (card: any, index: number) => {
    setSelectedCard(card);
    setSelectedCardIndex(index);
    setExpandedCardId(expandedCardId === card.id ? null : card.id);
  };

  useEffect(() => {
    if (playerCards.length > 0 && !selectedCard) setSelectedCard(playerCards[0]);
  }, [selectedCard]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Search and Filters */}
      <Card className="lg:w-1/3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Player Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Players</label>
            <Input placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Filter by Team</label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="Western Bulldogs">Western Bulldogs</SelectItem>
                <SelectItem value="Richmond">Richmond</SelectItem>
                <SelectItem value="Geelong">Geelong</SelectItem>
                <SelectItem value="Melbourne">Melbourne</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {filteredPlayers.map((player) => (
              <div key={player.id} className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedPlayer.id === player.id ? "border-blue-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"}`} onClick={() => setSelectedPlayer(player)}>
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-gray-600">{player.team} • {player.position}</div>
                <div className="text-xs text-orange-600 mt-1">Efficiency: {player.efficiency}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Player Statistics + Cards + Comparison */}
      <div className="lg:w-2/3 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Player Statistics - {selectedPlayer.name}</span>
              <Badge variant="outline">{selectedPlayer.team}</Badge>
            </CardTitle>
            <CardDescription>{selectedPlayer.position}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg"><div className="text-2xl font-bold text-purple-600">{selectedPlayer.kicks}</div><div className="text-sm text-gray-600">Kicks</div></div>
              <div className="text-center p-4 bg-orange-50 rounded-lg"><div className="text-2xl font-bold text-orange-600">{selectedPlayer.handballs}</div><div className="text-sm text-gray-600">Handballs</div></div>
              <div className="text-center p-4 bg-purple-50 rounded-lg"><div className="text-2xl font-bold text-purple-600">{selectedPlayer.marks}</div><div className="text-sm text-gray-600">Marks</div></div>
              <div className="text-center p-4 bg-orange-50 rounded-lg"><div className="text-2xl font-bold text-orange-600">{selectedPlayer.tackles}</div><div className="text-sm text-gray-600">Tackles</div></div>
              <div className="text-center p-4 bg-red-50 rounded-lg"><div className="text-2xl font-bold text-red-600">{selectedPlayer.goals}</div><div className="text-sm text-gray-600">Goals</div></div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg"><div className="text-2xl font-bold text-yellow-600">{selectedPlayer.efficiency}%</div><div className="text-sm text-gray-600">Efficiency</div></div>
            </div>
          </CardContent>
        </Card>

        {/* Trading Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Activity className="w-5 h-5" /> Player Profiles</div>
              <Button variant="outline" size="sm" onClick={() => setShowAllCards(!showAllCards)}>{showAllCards ? "Show One" : "View All"}</Button>
            </CardTitle>
            <CardDescription>View AFL player profiles with stats and performance data</CardDescription>
          </CardHeader>
          <CardContent>
            {showAllCards ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {playerCards.map((card, index) => (
                  <div key={card.id} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer" onClick={() => handleCardClick(card, index)}>
                    <img src={card.image} alt={card.name} className="w-full h-40 object-cover" />
                    <div className="p-3">
                      <div className="text-sm text-gray-500">#{card.number} • {card.team}</div>
                      <div className="font-semibold">{card.name}</div>
                      <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                        <div><div className="font-bold">{card.stats.kicks}</div><div className="text-gray-500">Kicks</div></div>
                        <div><div className="font-bold">{card.stats.marks}</div><div className="text-gray-500">Marks</div></div>
                        <div><div className="font-bold">{card.stats.tackles}</div><div className="text-gray-500">Tackles</div></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              selectedCard && (
                <div className="max-w-2xl mx-auto border rounded-lg overflow-hidden shadow">
                  <img src={selectedCard.image} alt={selectedCard.name} className="w-full h-64 object-cover" />
                  <div className="p-4">
                    <div className="text-sm text-gray-500">#{selectedCard.number} • {selectedCard.team}</div>
                    <div className="font-bold text-lg">{selectedCard.name}</div>
                    <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                      <div><div className="font-bold">{selectedCard.stats.goalAccuracy}%</div><div className="text-gray-500">Accuracy</div></div>
                      <div><div className="font-bold">{selectedCard.stats.disposals}</div><div className="text-gray-500">Disposals</div></div>
                      <div><div className="font-bold">{selectedCard.stats.handballs}</div><div className="text-gray-500">Handballs</div></div>
                    </div>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>

        <PlayerComparison
          selectedPlayer={selectedPlayer}
          comparisonPlayer={comparisonPlayer}
          setComparisonPlayer={setComparisonPlayer}
          mockPlayers={players}
          playerComparisonData={playerComparisonData as any}
        />
      </div>
    </div>
  );
}
