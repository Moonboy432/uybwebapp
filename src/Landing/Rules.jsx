import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Clock,
  CircleDot,
  Trophy,
  Repeat,
  ShieldAlert,
  Square,
  Hand,
  RotateCcw,
  Flag,
  Shirt,
  Handshake,
  Timer,
  Gavel,
  Info,
  Wallet,
} from "lucide-react";

const sections = [
  {
    heading: "The teams",
    accent: {
      bg: "bg-emerald-500",
      text: "text-emerald-900",
      light: "bg-emerald-50",
    },
    items: [
      {
        icon: Users,
        title: "Team structure",
        points: [
          "Maximum four teams take part in the game day.",
          "Each team fields 5 outfield players and 1 goalkeeper with one sub each if available.",
          "Total number of players allowed on the field per game day is 28.",
          "Squads stay fixed unless organizers approve a change.",
        ],
      },
    ],
  },

  {
    heading: "Payment System",
    accent: {
      bg: "bg-emerald-500",
      text: "text-emerald-900",
      light: "bg-emerald-50",
    },
    items: [
      {
        icon: Wallet,
        title: "Account",
        points: [
          "Gate fee is 200TL/6000 nairas per player ",
          "Players are advised to pay gate fees in advance.",
          "Our modes of payment remains cash, Naira transers and IBAN transfers.",
          "Advance payments are promptly recorded on every player's personal dashboard on the app.",
          
          
        ],
      },
    ],
  },

  {
    heading: "The match",
    accent: { bg: "bg-sky-500", text: "text-sky-900", light: "bg-sky-50" },
    items: [
      {
        icon: Clock,
        title: "Match format",
        points: [
          "Every team plays every other team.",
          "Matches run 8–10 minutes, or as set by organizers.",
          "A short break separates each match.",
        ],
      },
      {
        icon: CircleDot,
        title: "Kick-off",
        points: [
          "1st, 2nd, 3rd and 4th captain will be decided by the order of the entry list.",
          "If players on the order are absent, other players can be nominated for captainship role.",
        ],
      },
      {
        icon: RotateCcw,
        title: "Restarts",
        points: [
          "Kick-ins replace throw-ins unless stated otherwise.",
          "Opponents stay 5 metres back at free kicks, kick-ins, and corners.",
          "All free kicks are direct unless the referee says otherwise.",
        ],
      },
      {
        icon: Flag,
        title: "Offside",
        points: [
          "No offside rule, unless announced before the tournament begins.",
        ],
      },
      // {
      //   icon: CircleDot,
      //   title: "Match ball",
      //   points: ["The official ball provided by the organizers must be used."],
      // },
    ],
  },
  {
    heading: "Scoring & fair play",
    accent: {
      bg: "bg-amber-500",
      text: "text-amber-900",
      light: "bg-amber-50",
    },
    items: [
      {
        icon: Trophy,
        title: "Point System",
        points: [
          "100% Attendance = 100 points",
          "1 Goal = 3 points",
          "1 Assist = 2 points",
          "1 Cleansheet = 1 points (for GoalKeepers)",
          "1 Red Card = 3 points deduction",
          "1 Yellow Card = 1 points deduction",
        ],
      },
      {
        icon: Repeat,
        title: "Substitutions",
        points: [
          "Rolling substitutions are allowed.",
          "Subs happen only when play stops or the referee allows it.",
          "Goalkeepers can only be changed during a stoppage.",
        ],
      },
    ],
  },
  {
    heading: "Discipline",
    accent: { bg: "bg-rose-500", text: "text-rose-900", light: "bg-rose-50" },
    items: [
      {
        icon: ShieldAlert,
        title: "Fouls & conduct",
        points: [
          "Dangerous tackles are prohibited.",
          "Sliding tackles are not advised either.",
          "No reckless or violent conduct — respect everyone on the pitch.",
          "Persistent misconduct can mean suspension for the rest of the day.",
          "Playing without payment is prohibited.",
          "Any player who hands over his training bib to a player who hasn't paid before playing will be heavily penalized.",
          "Anyone who fights stands the risk of being suspended from the club."
        ],
      },
      {
        icon: Square,
        title: "Yellow & red cards",
        points: [
          "Yellow card: an official warning. Two in one match = red.",
          "Red card: immediate dismissal from the match.",
          "A sent-off player can't be replaced for 2 minutes, or until the other team scores — whichever comes first.",
        ],
        cardVisual: true,
      },
    ],
  },
  {
    heading: "On the pitch",
    accent: {
      bg: "bg-violet-500",
      text: "text-violet-900",
      light: "bg-violet-50",
    },
    items: [
      {
        icon: Hand,
        title: "Goalkeeper rules",
        points: [
          "Hands only inside the penalty area.",
          "No handling a deliberate back pass from a teammate.",
          "Distribution must be timely — no time-wasting.",
        ],
      },
      {
        icon: Shirt,
        title: "Equipment",
        points: [
          "Matching bibs or jerseys are required.",
          "Shin guards are strongly recommended.",
          "Proper football footwear only, no jewellery or dangerous accessories.",
        ],
      },
    ],
  },
  {
    heading: "Spirit of the game",
    accent: { bg: "bg-teal-500", text: "text-teal-900", light: "bg-teal-50" },
    items: [
      {
        icon: Handshake,
        title: "Fair play",
        points: [
          "Shake hands before and after every match.",
          "Respect officials' decisions at all times.",
          "Unsporting behaviour, abuse, or fighting will not be tolerated.",
        ],
      },
      {
        icon: Timer,
        title: "Timekeeping",
        points: [
          "The referee's decision on time is final.",
          "No stoppage time unless organizers require it.",
        ],
      },
      {
        icon: Gavel,
        title: "Organizer's decision",
        points: [
          "Organizers may amend fixtures, match duration, or rules as needed.",
          "All disputes are settled by the organizers — final say.",
        ],
      },
    ],
  },
];

export default function Event() {
  return (
    <section className="min-h-screen bg-gradient-to-r from-blue-400 to-blue-300 text-white pb-16">
      {/* Top bar */}
      <div className="w-full h-12 fixed top-0 left-0 bg-gradient-to-r from-blue-400 to-blue-300 shadow-md flex items-center px-4 z-50">
        <Link to="/Home">
          <p className="flex items-center gap-2 text-white hover:text-yellow-400 font-bold">
            <ArrowLeft /> Homepage
          </p>
        </Link>
      </div>

      <div className="pt-24 px-4 max-w-3xl mx-auto">
        {/* Header / badge */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="flex items-center gap-2 cursor-pointer">
            <img
              src="/uybfclogo.png"
              alt="Club Logo"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-3xl font-black tracking-tight drop-shadow-sm">
            4-Team Game Day
          </h1>
          <p className="text-white/90 font-semibold mt-1">
            Rules &amp; Regulations
          </p>
          <span className="mt-3 inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1 rounded-full">
            6-a-side · 5 outfield players + 1 goalkeeper
          </span>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.heading}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${section.accent.bg}`}
                />
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {section.heading}
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="bg-white rounded-2xl shadow-lg p-5 text-gray-800"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-9 h-9 rounded-full ${section.accent.light} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className={`w-5 h-5 ${section.accent.text}`} />
                        </div>
                        <h3 className="font-bold text-gray-900">
                          {item.title}
                        </h3>
                      </div>

                      {item.cardVisual && (
                        <div className="flex gap-2 mb-3">
                          <span className="w-6 h-8 rounded-sm bg-yellow-400 shadow-sm" />
                          <span className="w-6 h-8 rounded-sm bg-red-600 shadow-sm" />
                        </div>
                      )}

                      <ul className="space-y-1.5">
                        {item.points.map((point, i) => (
                          <li
                            key={i}
                            className="text-sm leading-snug flex gap-2"
                          >
                            <span
                              className={`mt-1.5 w-1.5 h-1.5 rounded-full ${section.accent.bg} flex-shrink-0`}
                            />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Most important rule */}
        <div className="mt-10 bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Info className="w-5 h-5 text-yellow-300" />
            <h3 className="font-bold text-yellow-300 uppercase tracking-wide text-sm">
              Most important rule
            </h3>
          </div>
          <p className="font-semibold text-white">
            Enjoy the football, respect everyone on the pitch, and play in the
            spirit of fair competition.
          </p>
        </div>
      </div>
    </section>
  );
}
