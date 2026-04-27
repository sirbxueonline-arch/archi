"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, ChevronDown, ChevronUp, Send, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import { getInitials } from "@/lib/utils";

interface QAItem {
  id: string;
  askerName: string;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
}

interface QASectionProps {
  profileId: string;
  ownerUserId: string | null;
  architectName: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("az-AZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function QASection({ profileId, ownerUserId, architectName }: QASectionProps) {
  const [isOwner, setIsOwner] = useState(false);
  const [questions, setQuestions] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [askOpen, setAskOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [savingAnswerId, setSavingAnswerId] = useState<string | null>(null);

  // Determine ownership client-side (auth is localStorage-based)
  useEffect(() => {
    if (!ownerUserId) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsOwner(!!(session?.user?.id && session.user.id === ownerUserId));
    });
  }, [ownerUserId]);

  const loadQuestions = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profileQuestions")
      .select("id, askerName, question, answer, answeredAt, createdAt")
      .eq("profileId", profileId)
      .eq("isPublic", true)
      .order("createdAt", { ascending: false });
    setQuestions(data ?? []);
    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmitQuestion = async () => {
    if (!questionText.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const askerName = session?.user?.user_metadata?.name ?? "Anonim";

    const { error } = await supabase.from("profileQuestions").insert({
      profileId,
      askerUserId: session?.user?.id ?? null,
      askerName,
      question: questionText.trim(),
    });

    if (!error) {
      setQuestionText("");
      setAskOpen(false);
      await loadQuestions();
    }
    setSubmitting(false);
  };

  const handleSaveAnswer = async (questionId: string) => {
    const answer = answerText[questionId]?.trim();
    if (!answer) return;
    setSavingAnswerId(questionId);
    const supabase = createClient();
    await supabase
      .from("profileQuestions")
      .update({ answer, answeredAt: new Date().toISOString() })
      .eq("id", questionId);
    setAnsweringId(null);
    setAnswerText((prev) => ({ ...prev, [questionId]: "" }));
    await loadQuestions();
    setSavingAnswerId(null);
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-heading font-semibold text-xl">Sual & Cavab</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Bu memar haqqında suallarınızı verin
          </p>
        </div>
        {!isOwner && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setAskOpen((prev) => !prev)}
          >
            <MessageSquare className="w-4 h-4" />
            Sual ver
          </Button>
        )}
      </div>

      {/* Ask question form */}
      {askOpen && !isOwner && (
        <div className="bg-slate-50 rounded-2xl p-4 border border-border mb-5">
          <p className="text-sm font-medium mb-3">Yeni sual</p>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Sualınızı buraya yazın…"
            rows={3}
            className="w-full text-sm bg-white border border-border rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              onClick={() => { setAskOpen(false); setQuestionText(""); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Ləğv et
            </button>
            <Button
              size="sm"
              variant="gradient"
              className="gap-1.5"
              onClick={handleSubmitQuestion}
              disabled={!questionText.trim() || submitting}
              loading={submitting}
            >
              <Send className="w-3.5 h-3.5" />
              Göndər
            </Button>
          </div>
        </div>
      )}

      {/* Q&A list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((qa) => {
            const isExpanded = expanded.includes(qa.id);
            const hasAnswer = !!qa.answer;
            return (
              <div key={qa.id} className="bg-slate-50 rounded-2xl p-4 border border-border">
                {/* Question row */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                    {getInitials(qa.askerName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold">{qa.askerName}</p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDate(qa.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{qa.question}</p>
                  </div>
                  {hasAnswer && (
                    <button
                      onClick={() => toggleExpand(qa.id)}
                      className="text-muted-foreground hover:text-primary transition-colors shrink-0 mt-0.5"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Answer */}
                {hasAnswer && isExpanded && (
                  <div className="mt-3 ml-11 pl-4 border-l-2 border-primary/30">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Award className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-primary">
                            {architectName}
                            <span className="ml-1.5 text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                              Memar
                            </span>
                          </p>
                          {qa.answeredAt && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatDate(qa.answeredAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{qa.answer}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Collapsed hint */}
                {hasAnswer && !isExpanded && (
                  <button
                    onClick={() => toggleExpand(qa.id)}
                    className="mt-2 ml-11 text-xs text-primary hover:underline font-medium"
                  >
                    Cavabı göstər →
                  </button>
                )}

                {/* Owner: answer box */}
                {isOwner && !hasAnswer && (
                  <div className="mt-3 ml-11">
                    {answeringId === qa.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={answerText[qa.id] ?? ""}
                          onChange={(e) => setAnswerText((prev) => ({ ...prev, [qa.id]: e.target.value }))}
                          placeholder="Cavabınızı yazın…"
                          rows={2}
                          className="w-full text-sm bg-white border border-border rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="gradient"
                            className="gap-1.5"
                            onClick={() => handleSaveAnswer(qa.id)}
                            disabled={!answerText[qa.id]?.trim() || savingAnswerId === qa.id}
                          >
                            {savingAnswerId === qa.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            Cavabla
                          </Button>
                          <button
                            onClick={() => setAnsweringId(null)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Ləğv et
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAnsweringId(qa.id)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Bu suala cavab ver →
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl p-4 border border-border text-center py-10">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground">Hələ sual verilməyib</p>
        </div>
      )}
    </div>
  );
}
